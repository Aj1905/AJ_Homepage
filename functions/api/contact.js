const CONTACT_TO_EMAIL = 'jun.akita57@gmail.com';
const MAX_LENGTHS = {
    name: 120,
    email: 254,
    subject: 160,
    message: 4000
};

const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), {
    status,
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    }
});

const normalizeField = (value, maxLength) => {
    if (typeof value !== 'string') {
        return '';
    }

    return value.trim().slice(0, maxLength);
};

const escapeHtml = (value) => value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function onRequestPost({ request, env }) {
    const contentLength = Number(request.headers.get('content-length') || 0);

    if (contentLength > 12000) {
        return jsonResponse({ message: '送信内容が長すぎます。内容を短くしてください。' }, 413);
    }

    let body;

    try {
        body = await request.json();
    } catch {
        return jsonResponse({ message: '送信内容を読み取れませんでした。' }, 400);
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return jsonResponse({ message: '送信内容を読み取れませんでした。' }, 400);
    }

    if (body.website) {
        return jsonResponse({ message: '送信しました。' });
    }

    const name = normalizeField(body.name, MAX_LENGTHS.name);
    const email = normalizeField(body.email, MAX_LENGTHS.email);
    const subject = normalizeField(body.subject, MAX_LENGTHS.subject);
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

    const resendResponse = await fetch('https://api.resend.com/emails', {
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

    if (!resendResponse.ok) {
        const errorText = await resendResponse.text();
        console.error('Resend email API failed', resendResponse.status, errorText);
        return jsonResponse({ message: 'メール送信に失敗しました。時間をおいて再度お試しください。' }, 502);
    }

    return jsonResponse({ message: '送信しました。' });
}

export function onRequest() {
    return jsonResponse({ message: 'Method Not Allowed' }, 405);
}
