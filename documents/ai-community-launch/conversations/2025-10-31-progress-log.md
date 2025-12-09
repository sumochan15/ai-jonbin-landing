# 2025-10-31 AI Jonbin Guild 構築ログ

## Webページ制作・デプロイ
- `documents/ai-community-launch/web-copy/landing-page.html` を中心に LP を構築。Hero/学習/ベネフィット/価格など各セクションを整理し、SVGビジュアルや日本語テキストを整備。
- `index.html` を生成して Vercel デプロイの 404 を解消。favicon（`assets/favicon.svg`）も追加し、ブラウザタブのアイコンを設定。
- GitHub リポジトリ `sumochan15/ai-jonbin-landing` を初期化し、`main` ブランチを運用。Vercel CLI で本番デプロイ。
- Vercel のプロジェクトエイリアスを `https://ai-jonbin-guild.vercel.app/` に統一（旧 `web-copy-lake.vercel.app` は削除）。
- 必要に応じて `vercel alias set <最新URL> ai-jonbin-guild.vercel.app` を実行して固定URLを最新に向け直す運用。

## Discord 自動化スクリプト
- `discord_manage.py` を作成。環境変数 `DISCORD_TOKEN` を使用して Bot 操作が可能。
  - `setup-from-json` (チャンネル構成作成)、`post-messages` (定型文投稿)、`list-channels`、`list-guilds`、`ping` を実装。
- チャンネル構成は `discord_structure.json` に定義（カテゴリ・チャンネル名を日本語＋絵文字で整理）。
- ローカルでは `.venv` 仮想環境を利用し `requests` をインストール。手元で `export DISCORD_TOKEN="..."` すればスクリプトを実行可能。

## GitHub Actions
- `.github/workflows/discord-management.yml` を追加（手動トリガー `workflow_dispatch`）。
  - `operation`（post-messages / setup-from-json / list-channels）と `guild_id` を指定して実行。
  - Secrets に `DISCORD_TOKEN` を登録し、Actions 内で環境変数として利用。
  - これにより GitHub からもボタン一つで Bot 操作が可能。

## 最近のメンテナンス事項
- favicon 追加後、Vercel に再デプロイ。固定URL `ai-jonbin-guild.vercel.app` に再割り当て済み。
- Vercel の旧エイリアスを整理（`vercel alias rm web-copy-lake.vercel.app`）。
- 2025-10-31 時点でも最新デプロイを `vercel --prod --yes` で更新。固定URLは常に最新に向くよう `vercel alias set` を実行。
- GitHub `main` が他端末から更新された場合は `git pull` で同期。必要に応じて退避フォルダ `tmp_backup/` を利用。

## 運用メモ
### ローカルで Bot 操作を行う例
```
export DISCORD_TOKEN="再発行したBotトークン"
source /Users/yohei/Documents/vault/documents/ai-community-launch/.venv/bin/activate
cd /Users/yohei/Documents/vault/documents/ai-community-launch
python discord_manage.py post-messages 1433485353532260364
```

### GitHub Actions から実行する例
1. GitHub → Actions → Discord Management を選択
2. 「Run workflow」を押し、`operation`, `guild_id` を入力
3. 実行ログで結果を確認

### デプロイ更新時の例
```
cd /Users/yohei/Documents/vault/documents/ai-community-launch/web-copy
vercel --prod --yes
vercel alias set <表示された最新URL> ai-jonbin-guild.vercel.app
```

固定URL: `https://ai-jonbin-guild.vercel.app/` （シークレットウィンドウや他端末からアクセスして最新を確認）

