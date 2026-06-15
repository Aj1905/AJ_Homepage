// ハンバーガーメニューのトグル
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
        const willOpen = mobileMenu.hidden;

        mobileMenu.hidden = !willOpen;
        hamburger.classList.toggle('is-open', willOpen);
        hamburger.setAttribute('aria-expanded', String(willOpen));
        document.body.classList.toggle('menu-open', willOpen);
    });

    // メニューリンククリック時にメニューを閉じる
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.hidden = true;
            hamburger.classList.remove('is-open');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('menu-open');
        });
    });
}

// スクロール時のナビゲーションバーのスタイル変更
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.site-header');
    if (!navbar) return;

    if (window.scrollY > 50) {
        navbar.classList.add('is-scrolled');
    } else {
        navbar.classList.remove('is-scrolled');
    }
});

// お問い合わせフォームの処理
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const contactStatus = document.createElement('p');
    contactStatus.className = 'form-status';
    contactStatus.setAttribute('role', 'status');
    contactStatus.setAttribute('aria-live', 'polite');
    submitButton.insertAdjacentElement('afterend', contactStatus);

    const setContactStatus = (message, type = '') => {
        contactStatus.textContent = message;
        contactStatus.className = type ? `form-status is-${type}` : 'form-status';
    };

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!contactForm.reportValidity()) {
            return;
        }

        const formData = new FormData(contactForm);
        const payload = Object.fromEntries(formData.entries());

        submitButton.disabled = true;
        submitButton.textContent = '送信中...';
        setContactStatus('送信しています。');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(result.message || '送信に失敗しました。時間をおいて再度お試しください。');
            }

            contactForm.reset();
            setContactStatus('送信しました。内容を確認して返信します。', 'success');
        } catch (error) {
            setContactStatus(error.message, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = '送信';
        }
    });
}
