# IT / Tech Quiz App

React (Vite) + TypeScript + Tailwind CSS で構築された、シングルページアプリケーション (SPA) の問題集アプリです。
バックエンドサーバーを使用せず、すべての処理がクライアントサイドで完結するため、GitHub Pages などの静的ホスティングサービスで簡単に公開することができます。

## 🌟 機能・特徴
* **モダンなUI**: Tailwind CSS を活用したグラスモーフィズムデザインや、ホバーアニメーションなどのリッチなUIを提供します。
* **状態管理**: React Hooks (`useState`) を用いて、現在の問題番号や正解数を管理しています。
* **インタラクティブな結果画面**: SVGアニメーションを用いた正答率のプログレスサークルを表示します。

## 🚀 ローカルでの動作確認方法

リポジトリを手元にクローン、またはダウンロードした後、以下のコマンドを実行してください。

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

ターミナルに表示されるローカルURL（例: `http://localhost:5173/`）にブラウザでアクセスすると、アプリが動作します。

## 🌐 GitHub Pages への公開（デプロイ）手順

このアプリを GitHub Pages でインターネット上に公開し、誰でもアクセスできるようにする手順です。

### 1. リポジトリの準備
1. [GitHub](https://github.com/new) にアクセスし、新しいリポジトリ（例: `tech-quiz-app`）を作成します。
2. 作成後、以下のコマンドで手元のコードを GitHub へプッシュします。

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/<あなたのユーザー名>/<リポジトリ名>.git
git push -u origin main
```

### 2. vite.config.ts の修正
GitHub Pages は `https://<あなたのユーザー名>.github.io/<リポジトリ名>/` というサブディレクトリ形式で公開されるため、`vite.config.ts` に `base` パスを設定する必要があります。

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/<リポジトリ名>/', // ← ここにGitHubリポジトリ名を追加
})
```
修正後、変更をコミットしてプッシュしてください。

### 3. GitHub Pages の有効化
1. GitHub のリポジトリ画面から **「Settings」** タブを開きます。
2. 左メニューの **「Pages」** を選択します。
3. **「Source」** を `GitHub Actions` に変更します。
4. 画面に表示される **「Static HTML」** の設定ボタン（Configure）をクリックします。
5. 右上の **「Commit changes...」** をクリックして設定ファイルを保存します。

### 4. ページへのアクセス
上記の設定を完了すると、数分後に自動的にデプロイ（公開処理）が完了します。
ブラウザで以下のURLにアクセスして、アプリを確認してください。

**👉 公開URL:** `https://<あなたのユーザー名>.github.io/<リポジトリ名>/`
