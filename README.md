# AJ ホームページ

個人事業主「AJ」の事業用ホームページの雛形です。

## ファイル構成

- `index.html` - メインのHTMLファイル（Tailwind CSS使用）
- `script.js` - JavaScriptファイル

## 使用技術

- **Tailwind CSS** - CDN経由で使用（https://cdn.tailwindcss.com）
- バニラJavaScript

## 機能

- レスポンシブデザイン（スマートフォン、タブレット、PC対応）
- スムーススクロール
- ハンバーガーメニュー（モバイル対応）
- お問い合わせフォーム
- モダンなUIデザイン

## カスタマイズ方法

### 1. 事業者情報の更新

`index.html`の事業者情報セクション（`#about`）を編集してください：

```html
<div class="detail-item">
    <strong>事業内容：</strong>ご記入ください
</div>
<div class="detail-item">
    <strong>所在地：</strong>ご記入ください
</div>
<div class="detail-item">
    <strong>お問い合わせ：</strong>ご記入ください
</div>
```

### 2. サービスの編集

`index.html`のサービスセクション（`#services`）のサービスカードを編集してください。

### 3. 色の変更

Tailwind CSSのクラスを直接変更するか、`index.html`の`tailwind.config`でテーマをカスタマイズできます。

例：メインカラーを変更する場合
- HTML内の`bg-blue-600`、`text-blue-600`などのクラスを別の色に変更
- または`tailwind.config`でカスタムカラーを定義

### 4. お問い合わせフォームの実装

`script.js`の`contactForm`イベントリスナー内で、実際の送信処理を実装してください。

一般的な実装方法：
- メール送信API（例: EmailJS、SendGrid）
- バックエンドAPIへの送信
- フォーム送信サービス（例: Formspree、Netlify Forms）

## 使用方法

1. ファイルをWebサーバーにアップロード
2. ブラウザで`index.html`を開く
3. 必要に応じて内容をカスタマイズ

## ライセンス

このテンプレートは自由に使用・改変できます。

