# 2025-10-31 AI Jonbin Guild 構築ログ

## Webページ制作・デプロイ
- `documents/ai-community-launch/web-copy/landing-page.html` を中心にLPを作成。
  - Hero/学習/ベネフィット/価格などのセクションを整理し、SVGビジュアルと日本語テキストを整備。
  - `discord_structure.json` など、将来的な自動化を見据えたファイルも追加。
- `landing-page.html` の公開用に `index.html` を生成し、Vercel デプロイでの 404 を解消。
- GitHub リポジトリ `sumochan15/ai-jonbin-landing` を初期化し、`main` ブランチへコミット。
- Vercel CLI を導入し、`web-copy` ディレクトリを `web-copy-*.vercel.app` に本番デプロイ。
  - Vercel 側の保護設定を公開状態へ変更（パブリックアクセス可能に）。

## Discord 自動化スクリプト
- `discord_manage.py`：Botトークンを環境変数で扱い、Python Requests で API 操作するスクリプトを作成。
  - `setup-from-json`：`discord_structure.json` に基づきカテゴリ/チャンネルを一括作成。
  - `post-messages`：主要チャンネルに定型メッセージ（歓迎・自己紹介テンプレ・案内）を投稿。
  - `list-guilds` / `list-channels` / `ping`：状態確認用の補助コマンドを実装。
- `discord_structure.json`：AIツール、Dify/n8n、自動化、コミュニティなど、カテゴリとチャンネル構成を日本語＋絵文字で定義。
- ローカルでは `.venv` 仮想環境と `requests` をセットアップし、トークンは `export DISCORD_TOKEN="..."` で手元のみ保持。

## GitHub Actions 連携
- `.github/workflows/discord-management.yml` を追加。
  - `workflow_dispatch` から `operation`（post-messages / setup-from-json / list-channels）と `guild_id` を指定して実行可能。
  - `DISCORD_TOKEN` は GitHub Secrets に保存（公開不要）。
  - Actions 実行時は `python documents/ai-community-launch/discord_manage.py ...` を呼び出す構成。
- 以降は GitHub の Actions → Discord Management → Run workflow で、PC側の作業なしに Bot 操作が可能。

## 運用メモ
- ローカル作業時は以下を実行：
  ```bash
  export DISCORD_TOKEN="再発行したBotトークン"
  source /Users/yohei/Documents/vault/documents/ai-community-launch/.venv/bin/activate
  cd /Users/yohei/Documents/vault/documents/ai-community-launch
  python discord_manage.py <command> <guild_id>
  ```
- GitHub Actions 経由で実行する場合：
  1. GitHub → Actions → Discord Management を選択。
  2. Run workflow で `operation` と `guild_id` を指定。
  3. 実行ログを確認。Discord 側で結果をチェック。
- 価格表示は「通常 2,980円 → 初期メンバーはずっと 980円」を明記済み。
- Vercel 公開URL（例）：`https://web-copy-obz5l77zf-yoheis-projects-25b2f081.vercel.app/`
- Discord Bot 情報：`AI Jonbin Bot`（TOKEN は Secrets/環境変数で管理）。

## 今後のカスタマイズ案
- `discord_structure.json` にカテゴリ追加 → `setup-from-json` で適用。
- `discord_manage.py` にメッセージ投稿のカスタムコマンド追加 → 既存の仕組みで反映。
- Vercel を GitHub 連携すれば push → 自動デプロイも可能。
