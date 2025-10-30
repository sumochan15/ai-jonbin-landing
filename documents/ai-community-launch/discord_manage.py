#!/usr/bin/env python3
"""Discord management helper script.

Usage examples:
  python discord_manage.py ping
  python discord_manage.py list-guilds
  python discord_manage.py list-channels <GUILD_ID>
  python discord_manage.py setup-from-json <GUILD_ID>
  python discord_manage.py post-messages <GUILD_ID>
"""
import json
import os
import sys
import time
from pathlib import Path
from typing import Dict

import requests

API_BASE = "https://discord.com/api"
SESSION = requests.Session()
BASE_DIR = Path(__file__).resolve().parent
STRUCTURE_FILE = BASE_DIR / "discord_structure.json"


def get_token() -> str:
    token = os.environ.get("DISCORD_TOKEN")
    if not token:
        print("DISCORD_TOKEN が設定されていません。", file=sys.stderr)
        sys.exit(1)
    return token


def request(method: str, endpoint: str, **kwargs) -> requests.Response:
    token = get_token()
    headers = kwargs.pop("headers", {})
    headers.setdefault("Authorization", f"Bot {token}")
    if method.upper() in {"POST", "PATCH", "PUT"}:
        headers.setdefault("Content-Type", "application/json")
    response = SESSION.request(method, f"{API_BASE}{endpoint}", headers=headers, timeout=15, **kwargs)
    return response


def ping() -> None:
    resp = request("GET", "/users/@me")
    if resp.status_code == 200:
        data = resp.json()
        print("✅ Botトークンで接続できました")
        print(f"   Bot ID   : {data.get('id')}")
        print(f"   Bot 名称 : {data.get('username')}#{data.get('discriminator')}")
    else:
        print("❌ 接続に失敗しました", resp.status_code, resp.text)
        sys.exit(1)


def list_guilds() -> None:
    resp = request("GET", "/users/@me/guilds")
    if resp.status_code != 200:
        print("❌ ギルド一覧の取得に失敗しました", resp.status_code, resp.text)
        sys.exit(1)
    guilds = resp.json()
    if not guilds:
        print("Bot が参加しているサーバーが見つかりません。")
        return
    print("参加中のサーバー一覧:")
    for g in guilds:
        print(f"- {g['name']} (ID: {g['id']})")


def list_channels(guild_id: str) -> None:
    resp = request("GET", f"/guilds/{guild_id}/channels")
    if resp.status_code != 200:
        print("❌ チャンネル一覧の取得に失敗しました", resp.status_code, resp.text)
        sys.exit(1)
    channels = resp.json()
    print(f"サーバー {guild_id} のチャンネル一覧:")
    for ch in channels:
        ch_type = ch.get("type")
        kind = {
            0: "テキスト",
            2: "ボイス",
            4: "カテゴリー",
            5: "アナウンス",
        }.get(ch_type, str(ch_type))
        parent = ch.get("parent_id")
        print(f"- {kind}: {ch['name']} (ID: {ch['id']}, Parent: {parent})")


def ensure_structure(guild_id: str) -> None:
    if not STRUCTURE_FILE.exists():
        print(f"❌ {STRUCTURE_FILE} が見つかりません。")
        sys.exit(1)

    with STRUCTURE_FILE.open("r", encoding="utf-8") as f:
        data = json.load(f)

    structure: Dict[str, Dict[str, str]] = data.get("structure", {})
    if not structure:
        print("❌ 構成ファイルに 'structure' が見つかりません。")
        sys.exit(1)

    resp = request("GET", f"/guilds/{guild_id}/channels")
    if resp.status_code != 200:
        print("❌ 既存チャンネルの取得に失敗しました", resp.status_code, resp.text)
        sys.exit(1)

    channels = resp.json()
    existing_channels: Dict[str, str] = {ch["name"]: ch["id"] for ch in channels}
    existing_categories = {ch["name"]: ch["id"] for ch in channels if ch.get("type") == 4}

    def create_category(name: str) -> str:
        if name in existing_categories:
            print(f"✅ カテゴリー『{name}』は既に存在します")
            return existing_categories[name]
        payload = {"name": name, "type": 4}
        resp = request("POST", f"/guilds/{guild_id}/channels", json=payload)
        if resp.status_code != 201:
            print(f"❌ カテゴリー『{name}』の作成に失敗しました", resp.status_code, resp.text)
            sys.exit(1)
        data = resp.json()
        existing_categories[name] = data["id"]
        print(f"🆕 カテゴリー『{name}』を作成しました")
        time.sleep(1)
        return data["id"]

    def create_text_channel(name: str, topic: str, parent_id: str) -> None:
        if name in existing_channels:
            print(f"✅ チャンネル『{name}』は既に存在します")
            return
        payload = {
            "name": name,
            "type": 0,
            "parent_id": parent_id,
            "topic": topic[:1024] if topic else None,
        }
        resp = request("POST", f"/guilds/{guild_id}/channels", json=payload)
        if resp.status_code != 201:
            print(f"❌ チャンネル『{name}』の作成に失敗しました", resp.status_code, resp.text)
            sys.exit(1)
        data = resp.json()
        existing_channels[name] = data["id"]
        print(f"🆕 チャンネル『{name}』を作成しました (カテゴリ: {parent_id})")
        time.sleep(1)

    print("チャンネル構成の設定を開始します…")
    for category_name, channel_dict in structure.items():
        parent_id = create_category(category_name)
        for channel_name, topic in channel_dict.items():
            create_text_channel(channel_name, topic, parent_id)

    print("✅ 設定が完了しました。Discord をご確認ください。")


def post_messages(guild_id: str) -> None:
    """指定したチャンネルに定型メッセージを投稿する"""
    messages = {
        "1433493715682328669": (
            "🌟 **AI Jonbin Guildへようこそ！**\n"
            "ここではAI活用と自動化を一緒に磨いていきます。まずは `📝・自己紹介` で簡単な自己紹介をお願いします。\n"
            "コミュニティのルールや最新情報は `📣・お知らせ` にまとめています。"
        ),
        "1433493721420267631": (
            "👤 **自己紹介テンプレート（参考）**\n"
            "```\n呼び名（ニックネーム）:\n普段どんなお仕事/活動をされていますか？\n興味のあるAIツールやテーマ:\n今後このコミュニティでやってみたいこと:\n```\n"
            "自由な形式でOKです！交流のきっかけづくりにご活用ください。"
        ),
        "1433493727502139443": (
            "💬 ここは雑談ラウンジです。最近試したAIツール、ちょっとした成功談や失敗談、近況報告などお気軽にどうぞ！"
        ),
        "1433493733503926394": (
            "❓ **質問ひろばの使い方**\n"
            "- 解決したい内容をできるだけ具体的に書いてください\n"
            "- 参考になりそうなリンクや画面キャプチャがあれば共有を\n"
            "- 回答する側は分かる範囲でOKです。お互いに助け合っていきましょう！"
        ),
        "1433493739199926333": (
            "📣 ここではコミュニティ全体へのお知らせをまとめます。イベントや新しい施策をここでチェックしましょう。"
        ),
        "1433493677791248548": (
            "🧩 **自動化質問箱の使い方**\n"
            "Dify / n8n / Zapier / 他ツール問わず、ワークフローで困ったことがあればこちらへ。質問時は以下を添えてください：\n"
            "1. 目指していること\n2. 現状（どこで詰まっているか）\n3. 使用しているノードやテンプレートなど"
        ),
        "1433493689338036296": (
            "📅 ここはイベント予定ページです。次回オンライン勉強会やミニワークショップのスケジュールをこちらにまとめます。"
        ),
        "1433493696061378647": (
            "📚 勉強会アーカイブをまとめる場所です。録画リンクや資料をアップしたら、補足コメントもよろしくお願いします。"
        ),
        "1433493646841483355": (
            "📢 **Dify関連のお知らせ**\n最新情報やアップデート、共有したいニュースがあればこちらにまとめていきます。"
        ),
    }

    for channel_id, content in messages.items():
        payload = {"content": content}
        resp = request("POST", f"/channels/{channel_id}/messages", json=payload)
        if resp.status_code in {200, 201}:
            print(f"📝 チャンネル {channel_id} へ投稿しました")
        else:
            print(f"❌ チャンネル {channel_id} への投稿に失敗しました", resp.status_code, resp.text)
        time.sleep(1)

    print("✅ メッセージ投稿が完了しました。Discordでご確認ください。")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    command = sys.argv[1]

    if command == "ping":
        ping()
    elif command == "list-guilds":
        list_guilds()
    elif command == "list-channels":
        if len(sys.argv) < 3:
            print("ギルドIDを指定してください")
            sys.exit(1)
        list_channels(sys.argv[2])
    elif command == "setup-from-json":
        if len(sys.argv) < 3:
            print("ギルドIDを指定してください")
            sys.exit(1)
        ensure_structure(sys.argv[2])
    elif command == "post-messages":
        if len(sys.argv) < 3:
            print("ギルドIDを指定してください")
            sys.exit(1)
        post_messages(sys.argv[2])
    else:
        print(f"Unknown command: {command}")
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()
