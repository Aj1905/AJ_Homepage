# AJ ホームページ

個人事業主「AJ」の事業用ホームページです。

## 📋 プロジェクト概要

このプロジェクトは、個人事業主「AJ」の公式ホームページです。モダンなデザインとレスポンシブ対応で、様々なデバイスで快適に閲覧できます。

## 🛠️ 使用技術

- **HTML5** - セマンティックなマークアップ
- **Tailwind CSS** - ユーティリティファーストのCSSフレームワーク（CDN経由）
- **JavaScript (Vanilla)** - インタラクティブな機能の実装
- **Cloudflare Pages** - ホスティング・CDN配信

## 📁 ファイル構成

```
AJHompage/
├── index.html      # メインのHTMLファイル
├── script.js       # JavaScriptファイル
├── styles.css      # カスタムスタイル（現在はTailwind CSS使用のため未使用）
└── README.md       # このファイル
```

## 🚀 セットアップ

### ローカルでの確認

1. リポジトリをクローン
```bash
git clone https://github.com/Aj1905/AJ_Homepage.git
cd AJ_Homepage
```

2. ブラウザで`index.html`を開く
   - または、ローカルサーバーを起動：
   ```bash
   # Python 3の場合
   python -m http.server 8000
   
   # Node.jsの場合（http-serverをインストール後）
   npx http-server
   ```

3. ブラウザで `http://localhost:8000` にアクセス

## ☁️ Cloudflare Pages へのデプロイ

Cloudflare Pagesを使用することで、高速なCDN配信と自動デプロイが可能です。

### デプロイ手順

1. **Cloudflareアカウントの作成**
   - [Cloudflare](https://www.cloudflare.com/)にアクセスしてアカウントを作成

2. **Cloudflare Pagesでプロジェクトを作成**
   - Cloudflare Dashboard > Pages > Create a project
   - "Connect to Git"を選択
   - GitHubアカウントを連携
   - リポジトリ `Aj1905/AJ_Homepage` を選択

3. **ビルド設定**
   - **Framework preset**: None (静的サイト)
   - **Build command**: （空欄にする、または削除）
   - **Build output directory**: `.` または `/` (ルートディレクトリ)
   - **Root directory**: `.` または `/` (ルートディレクトリ)

   ⚠️ **重要**: ビルドコマンドは**空欄**にしてください。`npx wrangler deploy`などのコマンドは不要です。

4. **デプロイ**
   - "Save and Deploy"をクリック
   - 数分でデプロイが完了し、自動的にURLが発行されます

### トラブルシューティング

**エラー: "Missing entry-point to Worker script" が表示される場合**

このエラーは、Cloudflare Pagesの設定でビルドコマンドが設定されている場合に発生します。以下の手順で修正してください：

1. Cloudflare Dashboardにログイン
2. **Pages** > プロジェクト名を選択
3. **Settings** > **Builds & deployments** を開く
4. **Build command** フィールドを**完全に空欄**にする（何も入力しない）
5. **Save** をクリック
6. **Deployments**タブに戻り、**Retry deployment**をクリック

**正しい設定例：**
- Framework preset: `None`
- Build command: **（空欄）**
- Build output directory: `.` または `/`
- Root directory: `.` または `/`

⚠️ **注意**: 静的サイトの場合、ビルドコマンドは不要です。`npx wrangler deploy`などのコマンドは削除してください。

### カスタムドメインの設定（オプション）

1. Cloudflare Pagesのプロジェクト設定 > Custom domains
2. ドメインを追加
3. DNS設定をCloudflareに変更（必要に応じて）

## ✏️ カスタマイズ方法

### 事業者情報の更新

`index.html`の事業者情報セクション（`#about`）を編集：

```html
<div class="text-lg">
    <strong class="text-gray-800">事業内容：</strong>
    <span class="text-gray-600">ご記入ください</span>
</div>
<div class="text-lg">
    <strong class="text-gray-800">所在地：</strong>
    <span class="text-gray-600">ご記入ください</span>
</div>
```

### サービスの編集

`index.html`のサービスセクション（`#services`）のサービスカードを編集：

```html
<div class="bg-white p-8 rounded-xl shadow-md...">
    <div class="text-5xl mb-4">💼</div>
    <h3 class="text-2xl font-semibold mb-4">サービス1</h3>
    <p class="text-gray-600 leading-relaxed">サービス内容...</p>
</div>
```

### 色の変更

Tailwind CSSのユーティリティクラスを変更：

- メインカラー: `bg-blue-600` → `bg-green-600` など
- テキストカラー: `text-blue-600` → `text-purple-600` など
- カスタムカラーを追加する場合は、`tailwind.config`を編集

### お問い合わせフォームの実装

`script.js`の`contactForm`イベントリスナー内で、実際の送信処理を実装してください。

**推奨サービス：**
- [Formspree](https://formspree.io/) - 簡単なフォーム送信サービス
- [EmailJS](https://www.emailjs.com/) - メール送信API
- [Netlify Forms](https://docs.netlify.com/forms/setup/) - Netlifyを使用している場合
- バックエンドAPIへの送信

## 🔄 更新・デプロイの流れ

1. ローカルで変更を加える
2. 変更をコミット
```bash
git add .
git commit -m "変更内容の説明"
git push
```
3. Cloudflare Pagesが自動的にデプロイを開始（数分で完了）

## 📱 機能

- ✅ レスポンシブデザイン（スマートフォン・タブレット・PC対応）
- ✅ スムーススクロール
- ✅ ハンバーガーメニュー（モバイル対応）
- ✅ お問い合わせフォーム
- ✅ スクロールアニメーション
- ✅ 高速なCDN配信（Cloudflare）

## 🌐 セクション構成

1. **ヒーローセクション** - トップのメインビジュアル
2. **サービス** - 提供サービスの紹介
3. **事業者情報** - 屋号「AJ」と事業者情報
4. **お問い合わせ** - お問い合わせフォーム

## 📝 ライセンス

このプロジェクトは個人事業主「AJ」の公式ホームページです。

## 🔗 リンク

- GitHub: https://github.com/Aj1905/AJ_Homepage
- Cloudflare Pages: （デプロイ後にURLが発行されます）

## 📞 お問い合わせ

- TEL: 080-5614-7439

---

**更新日**: 2024年

