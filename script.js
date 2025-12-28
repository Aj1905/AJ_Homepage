// ハンバーガーメニューのトグル
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        // ハンバーガーアイコンのアニメーション
        const spans = hamburger.querySelectorAll('span');
        if (!mobileMenu.classList.contains('hidden')) {
            spans[0].style.transform = 'rotate(45deg) translateY(8px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    // メニューリンククリック時にメニューを閉じる
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            const spans = hamburger.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });
}

// スクロール時のナビゲーションバーのスタイル変更
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('header');
    if (window.scrollY > 50) {
        navbar.classList.add('shadow-lg');
    } else {
        navbar.classList.remove('shadow-lg');
    }
});

// お問い合わせフォームの処理
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // フォームデータの取得
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };
        
        // ここで実際の送信処理を実装してください
        // 例: メール送信APIの呼び出し、フォーム送信サービスの使用など
        
        // デモ用のアラート
        alert('お問い合わせありがとうございます。\n送信機能は実装が必要です。\n\n送信内容:\n' + 
              'お名前: ' + formData.name + '\n' +
              'メール: ' + formData.email + '\n' +
              '件名: ' + formData.subject + '\n' +
              '内容: ' + formData.message);
        
        // フォームをリセット
        contactForm.reset();
    });
}

// スクロールアニメーション
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
        }
    });
}, observerOptions);

// アニメーション対象の要素を監視
document.querySelectorAll('section > div > div').forEach(el => {
    observer.observe(el);
});

