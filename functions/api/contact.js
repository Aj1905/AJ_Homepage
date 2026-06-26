const CONTACT_TO_EMAIL = 'jun.akita57@gmail.com';
const MAX_BODY_BYTES = 12000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const MAX_LENGTHS = {
    name: 120,
    email: 254,
    subject: 160,
    message: 4000
};
const JSON_HEADERS = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer'
};
const rateLimitStore = new Map();

class BodyTooLargeError extends Error {}

const jsonResponse = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), {
    status,
    headers: {
        ...JSON_HEADERS,
        ...headers
    }
});

const normalizeField = (value, maxLength, stripControls = false) => {
    if (typeof value !== 'string') {
        return '';
    }

    const normalized = stripControls
        ? value.replace(/[\u0000-\u001F\u007F]+/g, ' ')
        : value;

    return normalized.trim().slice(0, maxLength);
};

const escapeHtml = (value) => value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const isEmail = (value) => /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(value);

const isJsonRequest = (request) => {
    const contentType = request.headers.get('content-type') || '';
    return /^application\/json(?:\s*;|$)/i.test(contentType);
};

const normalizeOrigin = (value) => {
    try {
        return new URL(value).origin;
    } catch {
        return '';
    }
};

const getAllowedOrigins = (request, env) => {
    const allowedOrigins = new Set([new URL(request.url).origin]);

    String(env.ALLOWED_ORIGINS || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
        .map(normalizeOrigin)
        .filter(Boolean)
        .forEach((origin) => allowedOrigins.add(origin));

    return allowedOrigins;
};

const isAllowedRequestOrigin = (request, env) => {
    const allowedOrigins = getAllowedOrigins(request, env);
    const origin = request.headers.get('origin');

    if (origin) {
        return allowedOrigins.has(normalizeOrigin(origin));
    }

    const referer = request.headers.get('referer');

    if (referer) {
        return allowedOrigins.has(normalizeOrigin(referer));
    }

    return false;
};

const getClientId = (request) => {
    const forwardedFor = request.headers.get('x-forwarded-for') || '';
    const forwardedIp = forwardedFor.split(',')[0].trim();

    return request.headers.get('cf-connecting-ip') || forwardedIp || 'unknown';
};

const pruneRateLimitStore = (now) => {
    for (const [clientId, entry] of rateLimitStore) {
        if (entry.resetAt <= now) {
            rateLimitStore.delete(clientId);
        }
    }
};

const checkRateLimit = (request) => {
    const now = Date.now();

    if (rateLimitStore.size > 1000) {
        pruneRateLimitStore(now);
    }

    const clientId = getClientId(request);
    const entry = rateLimitStore.get(clientId);

    if (!entry || entry.resetAt <= now) {
        rateLimitStore.set(clientId, {
            count: 1,
            resetAt: now + RATE_LIMIT_WINDOW_MS
        });
        return { allowed: true };
    }

    entry.count += 1;

    if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
        return {
            allowed: false,
            retryAfter: Math.ceil((entry.resetAt - now) / 1000)
        };
    }

    return { allowed: true };
};

const readRequestText = async (request) => {
    const contentLength = Number(request.headers.get('content-length') || 0);

    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
        throw new BodyTooLargeError();
    }

    if (!request.body) {
        return '';
    }

    const reader = request.body.getReader();
    const chunks = [];
    let receivedBytes = 0;

    while (true) {
        const { done, value } = await reader.read();

        if (done) {
            break;
        }

        receivedBytes += value.byteLength;

        if (receivedBytes > MAX_BODY_BYTES) {
            await reader.cancel();
            throw new BodyTooLargeError();
        }

        chunks.push(value);
    }

    const bodyBytes = new Uint8Array(receivedBytes);
    let offset = 0;

    for (const chunk of chunks) {
        bodyBytes.set(chunk, offset);
        offset += chunk.byteLength;
    }

    return new TextDecoder().decode(bodyBytes);
};

export async function onRequestPost({ request, env = {} }) {
    if (!isAllowedRequestOrigin(request, env)) {
        return jsonResponse({ message: '許可されていない送信元です。' }, 403);
    }

    if (!isJsonRequest(request)) {
        return jsonResponse({ message: 'Content-Typeはapplication/jsonを指定してください。' }, 415);
    }

    const rateLimit = checkRateLimit(request);

    if (!rateLimit.allowed) {
        return jsonResponse(
            { message: '短時間に送信が集中しています。時間をおいて再度お試しください。' },
            429,
            { 'Retry-After': String(rateLimit.retryAfter) }
        );
    }

    let bodyText;

    try {
        bodyText = await readRequestText(request);
    } catch (error) {
        if (error instanceof BodyTooLargeError) {
            return jsonResponse({ message: '送信内容が長すぎます。内容を短くしてください。' }, 413);
        }

        return jsonResponse({ message: '送信内容を読み取れませんでした。' }, 400);
    }

    if (!bodyText) {
        return jsonResponse({ message: '送信内容を読み取れませんでした。' }, 400);
    }

    let body;

    try {
        body = JSON.parse(bodyText);
    } catch {
        return jsonResponse({ message: '送信内容を読み取れませんでした。' }, 400);
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return jsonResponse({ message: '送信内容を読み取れませんでした。' }, 400);
    }

    if (body.website) {
        return jsonResponse({ message: '送信しました。' });
    }

    const name = normalizeField(body.name, MAX_LENGTHS.name, true);
    const email = normalizeField(body.email, MAX_LENGTHS.email, true);
    const subject = normalizeField(body.subject, MAX_LENGTHS.subject, true);
    const message = normalizeField(body.message, MAX_LENGTHS.message);

    if (!name || !email || !message) {
        return jsonResponse({ message: 'お名前、メールアドレス、お問い合わせ内容を入力してください。' }, 400);
    }

    if (!isEmail(email)) {
        return jsonResponse({ message: 'メールアドレスの形式が正しくありません。' }, 400);
    }

    if (!env.RESEND_API_KEY) {
        return jsonResponse({ message: 'メール送信設定が未完了です。サイト管理者に連絡してください。' }, 500);
    }

    if (!env.RESEND_FROM_EMAIL) {
        return jsonResponse({ message: '送信元メールアドレスの設定が未完了です。サイト管理者に連絡してください。' }, 500);
    }

    const mailSubject = subject ? `【AJ HP】${subject}` : '【AJ HP】お問い合わせ';
    const submittedAt = new Date().toISOString();
    const text = [
        'AJホームページからお問い合わせが届きました。',
        '',
        `お名前: ${name}`,
        `メールアドレス: ${email}`,
        `件名: ${subject || '未入力'}`,
        `送信日時: ${submittedAt}`,
        '',
        'お問い合わせ内容:',
        message
    ].join('\n');
    const html = `
        <h2>AJホームページからお問い合わせが届きました。</h2>
        <table cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
            <tr><th align="left">お名前</th><td>${escapeHtml(name)}</td></tr>
            <tr><th align="left">メールアドレス</th><td>${escapeHtml(email)}</td></tr>
            <tr><th align="left">件名</th><td>${escapeHtml(subject || '未入力')}</td></tr>
            <tr><th align="left">送信日時</th><td>${escapeHtml(submittedAt)}</td></tr>
        </table>
        <h3>お問い合わせ内容</h3>
        <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
    `;

    let resendResponse;

    try {
        resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: env.RESEND_FROM_EMAIL,
                to: [env.CONTACT_TO_EMAIL || CONTACT_TO_EMAIL],
                reply_to: email,
                subject: mailSubject,
                text,
                html
            })
        });
    } catch {
        console.error('Resend email API request failed');
        return jsonResponse({ message: 'メール送信に失敗しました。時間をおいて再度お試しください。' }, 502);
    }

    if (!resendResponse.ok) {
        console.error('Resend email API failed', resendResponse.status);
        return jsonResponse({ message: 'メール送信に失敗しました。時間をおいて再度お試しください。' }, 502);
    }

    return jsonResponse({ message: '送信しました。' });
}

export function onRequest() {
    return jsonResponse({ message: 'Method Not Allowed' }, 405, { Allow: 'POST' });
}
