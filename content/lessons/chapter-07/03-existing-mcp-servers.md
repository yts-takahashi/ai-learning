---
title: "既存MCPサーバーの活用"
chapter: 7
chapterTitle: "MCP・ツール連携"
lessonNumber: 3
slug: "existing-mcp-servers"
duration: 20
difficulty: "beginner"
hasHandsOn: true
hasQuiz: true
---

## 概要

MCPエコシステムにはGitHub・Slack・データベースなど多くの公開サーバーが存在します。このレッスンでは、主要な公開MCPサーバーの一覧・特徴・Claude Desktopへの設定方法を学びます。

## 本文

### 主要な公開MCPサーバー

```mermaid
graph TD
    A[MCPサーバーエコシステム] --> B[Anthropic公式]
    A --> C[コミュニティ製]

    B --> B1[filesystem]
    B --> B2[github]
    B --> B3[slack]
    B --> B4[postgres]
    B --> B5[brave-search]
    B --> B6[puppeteer]

    C --> C1[各種DBコネクター]
    C --> C2[クラウドサービス連携]
    C --> C3[業務ツール連携]
```

### Anthropic公式サーバー

| サーバー名 | 提供する機能 | 用途 |
|-----------|------------|------|
| `@modelcontextprotocol/server-filesystem` | ファイル読み書き・ディレクトリ操作 | ローカルファイルの操作 |
| `@modelcontextprotocol/server-github` | リポジトリ・Issue・PR操作 | GitHub操作の自動化 |
| `@modelcontextprotocol/server-slack` | メッセージ送受信・チャンネル操作 | Slack操作の自動化 |
| `@modelcontextprotocol/server-postgres` | SQLクエリ・スキーマ参照 | DBの分析・操作 |
| `@modelcontextprotocol/server-brave-search` | Web検索 | 最新情報の検索 |
| `@modelcontextprotocol/server-puppeteer` | ブラウザ操作・スクレイピング | Webの自動化 |
| `@modelcontextprotocol/server-memory` | 知識グラフベースの記憶 | 会話をまたいだ記憶 |

### Claude Desktop への設定

Claude Desktop の設定ファイル（`claude_desktop_config.json`）にMCPサーバーを追加します。

**macOS のパス:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows のパス:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

### filesystemサーバーの設定例

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/username/Documents",
        "/Users/username/Desktop"
      ]
    }
  }
}
```

この設定で、Claude がDocumentsとDesktopフォルダ内のファイルを読み書きできるようになります。

### GitHubサーバーの設定例

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

### PostgreSQLサーバーの設定例

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://username:password@localhost/mydb"
      ]
    }
  }
}
```

### 複数サーバーを同時に使う

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/username/projects"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token"
      }
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your_brave_api_key"
      }
    }
  }
}
```

### サーバー選択の指針

```
Q: どのサーバーを使うべきか？

ファイル操作が必要 → filesystem
GitHubの自動化 → github
チーム通知・連絡 → slack
データ分析・クエリ → postgres / sqlite
最新情報の検索 → brave-search
Webスクレイピング → puppeteer
会話をまたいだ記憶 → memory
```

## ハンズオン

filesystemサーバーを設定して動作確認してみましょう。

### ステップ1：Node.js の確認

```bash
node --version  # v18以上が必要
npm --version
```

### ステップ2：filesystemサーバーのテスト実行

```bash
# 動作確認（インストールなしで実行）
npx -y @modelcontextprotocol/server-filesystem /tmp/mcp-test
```

### ステップ3：設定ファイルの作成

```bash
# macOSの場合
mkdir -p ~/Library/Application\ Support/Claude

cat > ~/Library/Application\ Support/Claude/claude_desktop_config.json << 'EOF'
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/tmp/claude-files"
      ]
    }
  }
}
EOF

# テスト用ディレクトリ作成
mkdir -p /tmp/claude-files
echo "# テストファイル\nこのファイルはMCPテスト用です。" > /tmp/claude-files/test.md
```

### ステップ4：Claude Desktopでの動作確認

Claude Desktopを再起動し、以下のように話しかけてみましょう：

```
「/tmp/claude-files の中にあるファイルを一覧してください」
「test.mdの内容を読んで要約してください」
「/tmp/claude-files/notes.md というファイルを作成して、今日学んだことを書いてください」
```

### ステップ5：Pythonでの設定生成スクリプト

```python
import json
import os
import platform

def generate_mcp_config(servers: dict) -> str:
    """MCP設定ファイルを生成する"""
    config = {"mcpServers": servers}
    return json.dumps(config, indent=2, ensure_ascii=False)

def get_config_path() -> str:
    """プラットフォームに応じた設定ファイルパスを返す"""
    system = platform.system()
    if system == "Darwin":
        return os.path.expanduser(
            "~/Library/Application Support/Claude/claude_desktop_config.json"
        )
    elif system == "Windows":
        return os.path.join(os.environ["APPDATA"], "Claude", "claude_desktop_config.json")
    else:
        return os.path.expanduser("~/.config/claude/claude_desktop_config.json")

# 使用例
servers = {
    "filesystem": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem",
                 os.path.expanduser("~/Documents")],
    }
}

config_path = get_config_path()
config_content = generate_mcp_config(servers)

print(f"設定ファイルのパス: {config_path}")
print(f"設定内容:\n{config_content}")
```

## クイズ

<!-- QUIZ:START -->
**Q1. Claude Desktop にMCPサーバーを追加するには何を編集しますか？**

- A) Claudeのソースコード
- B) `claude_desktop_config.json`
- C) `.env`ファイル
- D) `package.json`

**正解: B**
**解説:** Claude Desktop の設定ファイル `claude_desktop_config.json` の `mcpServers` セクションにサーバー設定を追加します。macOSでは `~/Library/Application Support/Claude/` に配置されています。

**Q2. `@modelcontextprotocol/server-filesystem` サーバーを使う際に引数で指定するものは何ですか？**

- A) APIキー
- B) データベースのURL
- C) アクセスを許可するディレクトリのパス
- D) モデル名

**正解: C**
**解説:** filesystemサーバーには、Claudeがアクセスを許可するディレクトリのパスを引数として指定します。指定したディレクトリ外のファイルにはアクセスできないため、セキュリティ上重要な設定です。

**Q3. MCPサーバーに環境変数（APIキー等）を渡す方法はどれですか？**

- A) サーバー名にAPIキーを含める
- B) 設定ファイルの `env` フィールドに指定する
- C) コマンドライン引数の最後に追加する
- D) MCPサーバーのソースコードに直接書く

**正解: B**
**解説:** MCPサーバーへの環境変数は、`claude_desktop_config.json` のサーバー設定内の `env` フィールドで指定します。GitHubトークンやAPIキーなどの秘密情報はソースコードや引数でなく環境変数として渡します。
<!-- QUIZ:END -->

## まとめ

- AnthropicとコミュニティがGitHub・Slack・DB・ファイルシステムなど多くのMCPサーバーを公開している
- `claude_desktop_config.json` の `mcpServers` セクションに設定を追加するだけで利用できる
- APIキーなどの秘密情報は `env` フィールドで環境変数として渡す
- 複数のサーバーを同時に設定してAIの能力を組み合わせられる

## 次のレッスン

次のレッスンでは、TypeScript SDKを使って独自のMCPサーバーを自作する基礎を学びます。
