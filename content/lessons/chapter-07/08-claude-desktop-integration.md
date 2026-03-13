---
title: "Claude Desktopとの統合"
chapter: 7
chapterTitle: "MCP・ツール連携"
lessonNumber: 8
slug: "claude-desktop-integration"
duration: 25
difficulty: "intermediate"
hasHandsOn: true
hasQuiz: true
---

## 概要

カスタムMCPサーバーをClaude Desktopに統合して、ローカル環境でAIエージェントを動作させます。設定のデバッグ方法・環境変数の管理・複数サーバーの組み合わせを学びます。

## 本文

### Claude Desktopの設定構造

```json
{
  "mcpServers": {
    "server-name": {
      "command": "実行コマンド",
      "args": ["引数1", "引数2"],
      "env": {
        "ENV_VAR": "値"
      }
    }
  }
}
```

### 設定ファイルの場所

| OS | パス |
|----|------|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux | `~/.config/claude/claude_desktop_config.json` |

### 様々な実行方法の設定

```json
{
  "mcpServers": {
    "npx-server": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"]
    },
    "node-server": {
      "command": "node",
      "args": ["/path/to/dist/index.js"]
    },
    "python-server": {
      "command": "python",
      "args": ["/path/to/server.py"]
    },
    "uv-server": {
      "command": "uv",
      "args": ["--directory", "/path/to/project", "run", "server.py"]
    }
  }
}
```

### デバッグ方法

**1. サーバーログの確認**

```bash
# macOSでClaude Desktopのログを確認
tail -f ~/Library/Logs/Claude/mcp*.log

# 特定サーバーのログ
tail -f ~/Library/Logs/Claude/mcp-server-my-server.log
```

**2. MCPサーバーの単体テスト**

```bash
# サーバーを直接起動してJSONを手動送信
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}' | node dist/index.js
```

**3. MCP Inspector（公式デバッグツール）**

```bash
# MCP Inspectorをインストール・起動
npx @modelcontextprotocol/inspector node /path/to/your/server.js
```

### よくあるエラーと対処法

```mermaid
graph TD
    A[サーバーが表示されない] --> B{ログを確認}
    B --> C[JSON構文エラー]
    B --> D[コマンドが見つからない]
    B --> E[権限エラー]

    C --> C1[設定ファイルのJSONをバリデーション]
    D --> D1[フルパスを使用/node等をパスに追加]
    E --> E1[ファイルの実行権限を付与]
```

**JSON構文エラーの確認:**

```bash
# 設定ファイルのJSONバリデーション
python3 -c "import json; json.load(open('claude_desktop_config.json'))"
```

**コマンドのフルパスを使う:**

```json
{
  "mcpServers": {
    "my-server": {
      "command": "/usr/local/bin/node",
      "args": ["/Users/username/my-mcp-server/dist/index.js"]
    }
  }
}
```

**which コマンドでパスを確認:**

```bash
which node    # /usr/local/bin/node
which npx     # /usr/local/bin/npx
which python  # /usr/bin/python
```

### 環境変数の安全な管理

```json
{
  "mcpServers": {
    "my-api-server": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "API_KEY": "your-secret-key",
        "DB_URL": "postgresql://user:pass@localhost/db",
        "NODE_ENV": "production"
      }
    }
  }
}
```

> **重要**: `claude_desktop_config.json` はバージョン管理に含めないこと。`.gitignore` に追加してください。

```bash
echo "claude_desktop_config.json" >> ~/.gitignore
```

### 実践的な設定例：開発者向けMCPスタック

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/dev/projects",
        "/Users/dev/Documents"
      ]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token"
      }
    },
    "custom-tools": {
      "command": "node",
      "args": ["/Users/dev/my-mcp-server/dist/index.js"],
      "env": {
        "DATABASE_URL": "postgresql://localhost/devdb",
        "API_BASE_URL": "https://api.mycompany.com"
      }
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your_brave_key"
      }
    }
  }
}
```

## ハンズオン

統合テストスクリプトを作成してみましょう。

### ステップ1：設定生成・検証スクリプト

```python
import json
import os
import platform
import subprocess
import sys

def get_config_path():
    """設定ファイルのパスを取得"""
    system = platform.system()
    if system == "Darwin":
        return os.path.expanduser(
            "~/Library/Application Support/Claude/claude_desktop_config.json"
        )
    elif system == "Windows":
        return os.path.join(os.environ["APPDATA"], "Claude", "claude_desktop_config.json")
    return os.path.expanduser("~/.config/claude/claude_desktop_config.json")

def validate_config(config_path: str) -> dict:
    """設定ファイルを検証する"""
    results = {"errors": [], "warnings": [], "info": []}

    # ファイルの存在確認
    if not os.path.exists(config_path):
        results["errors"].append(f"設定ファイルが見つかりません: {config_path}")
        return results

    # JSON構文確認
    try:
        with open(config_path) as f:
            config = json.load(f)
    except json.JSONDecodeError as e:
        results["errors"].append(f"JSON構文エラー: {e}")
        return results

    results["info"].append(f"JSON構文: 正常")

    # サーバー設定の確認
    servers = config.get("mcpServers", {})
    if not servers:
        results["warnings"].append("mcpServers が空です")
        return results

    results["info"].append(f"設定されたサーバー数: {len(servers)}")

    for name, server_config in servers.items():
        # コマンドの存在確認
        command = server_config.get("command", "")
        if not command:
            results["errors"].append(f"[{name}] command が指定されていません")
            continue

        # コマンドがパスに存在するか確認
        full_path = subprocess.run(
            ["which", command] if sys.platform != "win32" else ["where", command],
            capture_output=True, text=True
        ).stdout.strip()

        if full_path:
            results["info"].append(f"[{name}] コマンド確認: {full_path}")
        else:
            results["warnings"].append(f"[{name}] コマンド '{command}' がPATHに見つかりません")

        # 環境変数の値が設定されているか確認
        env_vars = server_config.get("env", {})
        for var, value in env_vars.items():
            if not value or value in ["your_token", "your_key", "your-secret"]:
                results["warnings"].append(f"[{name}] 環境変数 {var} が設定されていません")

    return results

# 実行
config_path = get_config_path()
results = validate_config(config_path)

print(f"設定ファイル: {config_path}\n")

if results["errors"]:
    print("❌ エラー:")
    for e in results["errors"]:
        print(f"  - {e}")

if results["warnings"]:
    print("⚠️  警告:")
    for w in results["warnings"]:
        print(f"  - {w}")

if results["info"]:
    print("✓ 情報:")
    for i in results["info"]:
        print(f"  - {i}")
```

## クイズ

<!-- QUIZ:START -->
**Q1. Claude Desktop の MCP設定変更後、変更を有効にするために必要なことはどれですか？**

- A) コンピュータを再起動する
- B) Claude Desktop を再起動する
- C) 設定ファイルを保存するだけで即時反映される
- D) MCPサーバーを手動で起動する

**正解: B**
**解説:** MCPサーバーの設定変更を有効にするには、Claude Desktop を再起動する必要があります。再起動時にClaude Desktopが設定ファイルを読み込み直し、設定されたMCPサーバーを起動します。

**Q2. MCPサーバーのデバッグで最初に確認すべきログはどこにありますか（macOS）？**

- A) `/var/log/system.log`
- B) `~/Library/Logs/Claude/mcp*.log`
- C) `~/.claude/logs/`
- D) コンソール.appでClaude関連のログ

**正解: B**
**解説:** macOSではClaude DesktopのMCPサーバーログは `~/Library/Logs/Claude/` に保存されます。`mcp-server-[サーバー名].log` という名前のファイルにサーバーのstderrが記録されます。

**Q3. `claude_desktop_config.json` をGitで管理する際の注意点はどれですか？**

- A) 必ずコミットして他の開発者と共有すべき
- B) APIキーや認証情報が含まれるため `.gitignore` に追加してバージョン管理から除外する
- C) 圧縮してからコミットする
- D) パブリックリポジトリのみに注意が必要

**正解: B**
**解説:** `claude_desktop_config.json` にはGitHubトークン・APIキーなどの機密情報が含まれるため、`.gitignore` に追加して絶対にバージョン管理に含めてはいけません。機密情報のGit漏洩は深刻なセキュリティ問題です。
<!-- QUIZ:END -->

## まとめ

- Claude Desktopの設定は `claude_desktop_config.json` の `mcpServers` セクションで管理する
- 設定変更後はClaude Desktopを再起動して反映させる
- デバッグは `~/Library/Logs/Claude/mcp*.log` とMCP Inspectorを活用する
- APIキー等の機密情報は `.gitignore` で除外する

## 次のレッスン

次のレッスンでは、MCPサーバーのセキュリティ設計（信頼境界・権限スコープ・認証の考え方）を学びます。
