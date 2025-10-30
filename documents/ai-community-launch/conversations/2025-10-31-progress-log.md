# 2025-10-31 AI Jonbin Guild 構築ログ

## Webページ制作・デプロイ
- `documents/ai-community-launch/web-copy/landing-page.html` を中心に LP を作成。
  - Hero/学習/ベネフィット/価格などのセクションを整理し、SVGビジュアルと日本語テキストを整備。
  - `index.html` も生成し、Vercel デプロイでの 404 を解消。
- GitHub リポジトリ `sumochan15/ai-jonbin-landing` を初期化し、`main` ブランチへコミット。
- Vercel CLI を導入し、`web-copy` ディレクトリを本番デプロイ。
  - Vercel 側の保護設定を公開に切り替え、タブ用アイコン（`assets/favicon.svg`）を追加。
  - Alias を `https://ai-jonbin-guild.vercel.app/` に設定して固定URL化。

## Discord 自動化スクリプト
- `discord_manage.py`：環境変数 `DISCORD_TOKEN` を使って Bot 操作するスクリプトを作成。
  - `setup-from-json`／`post-messages`／`list-channels`／`list-guilds`／`ping` などを実装。
- `discord_structure.json`：カテゴリ＋チャンネル構成を日本語＋絵文字で定義。
- ローカルでは `.venv` を使って `requests` をインストール。Botトークンは `export DISCORD_TOKEN="..."` で手元のみ保持。

## GitHub Actions
- `.github/workflows/discord-management.yml` を追加。
  - `workflow_dispatch` から `operation`（post-messages / setup-from-json / list-channels）と `guild_id` を指定して実行。
  - `DISCORD_TOKEN` は GitHub Secrets に保存し、先に登録済み。
  - Actions 実行時は `python documents/ai-community-launch/discord_manage.py ...` を呼び出す。

## デプロイURLまとめ
- 最新本番URL: `https://ai-jonbin-guild.vercel.app/`
- 直近のユニークURL例: `https://web-copy-bmcjmil98-yoheis-projects-25b2f081.vercel.app/`
- Alias の変更履歴: `web-copy-lake.vercel.app` → `ai-jonbin-guild.vercel.app`

## 次回の操作ガイド
- **ローカル作業**
  ```bash
  export DISCORD_TOKEN="再発行したBotトークン"
  source /Users/yohei/Documents/vault/documents/ai-community-launch/.venv/bin/activate
  cd /Users/yohei/Documents/vault/documents/ai-community-launch
  python discord_manage.py <command> <guild_id>
  ```
- **GitHub Actions**
  1. GitHub → Actions → Discord Management → Run workflow
  2. `operation` と `guild_id` を入力
  3. 実行ログで結果を確認
- **Vercel**
  - `vercel --prod` で新しいデプロイ（ユニークURL）が作成され、自動的に Alias が最新に向く。
  - 必要に応じて `vercel alias set <最新URL> ai-jonbin-guild.vercel.app` で手動割り当て可能。

