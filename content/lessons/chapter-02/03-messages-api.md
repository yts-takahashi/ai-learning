---
title: "Messages API の基本"
chapter: 2
chapterTitle: "API活用"
lessonNumber: 3
slug: "messages-api"
duration: 30
difficulty: "beginner"
hasHandsOn: true
hasQuiz: true
---

## 概要

Messages APIはClaude APIの中核です。リクエストパラメータの全容、レスポンス構造の詳細、Systemプロンプトとマルチターンの実装方法を学びます。実務で必要な全APIパターンを習得します。

## 本文

### Messages APIのエンドポイント

```
POST https://api.anthropic.com/v1/messages
```

### リクエストパラメータ一覧

| パラメータ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| `model` | string | ✓ | モデルID |
| `max_tokens` | int | ✓ | 最大出力トークン数 |
| `messages` | array | ✓ | 会話履歴 |
| `system` | string | - | Systemプロンプト |
| `temperature` | float | - | 多様性（0-1） |
| `top_p` | float | - | Nucleus Sampling |
| `stop_sequences` | array | - | 生成終了文字列 |
| `stream` | bool | - | ストリーミング |
| `metadata` | object | - | ユーザーIDなど |

### messagesパラメータの形式

```python
messages = [
    # ユーザーのテキストメッセージ
    {"role": "user", "content": "こんにちは"},

    # アシスタントの返答
    {"role": "assistant", "content": "こんにちは！何かお手伝いできますか？"},

    # ユーザーの次のメッセージ
    {"role": "user", "content": "Pythonを教えてください"},
]
```

**コンテンツブロック形式（マルチモーダル時）：**

```python
messages = [
    {
        "role": "user",
        "content": [
            {"type": "text", "text": "この画像を説明してください"},
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/jpeg",
                    "data": "<base64_encoded_data>"
                }
            }
        ]
    }
]
```

### stop_sequencesの活用

特定の文字列が出力されたら生成を止める：

```python
message = client.messages.create(
    model="claude-opus-4-5",
    max_tokens=1024,
    stop_sequences=["</result>", "---"],  # これが出たら終了
    messages=[{
        "role": "user",
        "content": "結果を<result>タグで囲んで答えてください"
    }]
)

# stop_reason が "stop_sequence" の場合、stop_sequencesに設定した文字列で終了
print(message.stop_reason)   # "stop_sequence" or "end_turn"
```

### metadataでユーザー追跡

```python
message = client.messages.create(
    model="claude-opus-4-5",
    max_tokens=1024,
    metadata={"user_id": "user_123"},  # レート制限・不正利用検知に活用
    messages=[{"role": "user", "content": "..."}]
)
```

### レスポンス構造の詳細

```python
message = client.messages.create(...)

# コンテンツ取得
text = message.content[0].text  # テキストブロック
# Tool Useの場合: message.content[0].type == "tool_use"

# 終了理由
# "end_turn"      - 正常終了
# "max_tokens"    - トークン上限で打ち切り
# "stop_sequence" - stop_sequencesに一致
# "tool_use"      - ツール呼び出しが必要

# 使用量
print(message.usage.input_tokens)
print(message.usage.output_tokens)
print(message.usage.cache_creation_input_tokens)  # キャッシュ作成
print(message.usage.cache_read_input_tokens)       # キャッシュ読み込み
```

## ハンズオン

完全なMessages APIラッパーを実装します。

### ステップ1：型安全なAPIラッパー

```python
import anthropic
from dataclasses import dataclass
from typing import Optional, Union
from enum import Enum

client = anthropic.Anthropic()

class StopReason(Enum):
    END_TURN = "end_turn"
    MAX_TOKENS = "max_tokens"
    STOP_SEQUENCE = "stop_sequence"
    TOOL_USE = "tool_use"

@dataclass
class MessageResult:
    text: str
    stop_reason: StopReason
    input_tokens: int
    output_tokens: int

    @property
    def is_complete(self) -> bool:
        return self.stop_reason == StopReason.END_TURN

    @property
    def was_truncated(self) -> bool:
        return self.stop_reason == StopReason.MAX_TOKENS

def create_message(
    messages: list[dict],
    model: str = "claude-opus-4-5",
    max_tokens: int = 1024,
    system: Optional[str] = None,
    temperature: Optional[float] = None,
    stop_sequences: Optional[list[str]] = None,
) -> MessageResult:
    kwargs = {
        "model": model,
        "max_tokens": max_tokens,
        "messages": messages,
    }
    if system:
        kwargs["system"] = system
    if temperature is not None:
        kwargs["temperature"] = temperature
    if stop_sequences:
        kwargs["stop_sequences"] = stop_sequences

    msg = client.messages.create(**kwargs)

    if msg.stop_reason == "max_tokens":
        import warnings
        warnings.warn(f"出力がmax_tokens({max_tokens})で打ち切られました", UserWarning)

    return MessageResult(
        text=msg.content[0].text,
        stop_reason=StopReason(msg.stop_reason),
        input_tokens=msg.usage.input_tokens,
        output_tokens=msg.usage.output_tokens,
    )
```

### ステップ2：Systemプロンプト + マルチターン

```python
class Chat:
    def __init__(self, system: str, model: str = "claude-opus-4-5"):
        self.system = system
        self.model = model
        self.history: list[dict] = []

    def send(self, user_message: str) -> MessageResult:
        self.history.append({"role": "user", "content": user_message})

        result = create_message(
            messages=self.history,
            system=self.system,
            model=self.model,
        )

        self.history.append({"role": "assistant", "content": result.text})
        return result

    def clear(self):
        self.history = []
```

### 完成コード

```python
import anthropic
from dataclasses import dataclass
from typing import Optional
from enum import Enum

client = anthropic.Anthropic()

class StopReason(str, Enum):
    END_TURN = "end_turn"
    MAX_TOKENS = "max_tokens"
    STOP_SEQUENCE = "stop_sequence"

@dataclass
class MessageResult:
    text: str
    stop_reason: str
    input_tokens: int
    output_tokens: int

    @property
    def is_complete(self) -> bool:
        return self.stop_reason == "end_turn"


class ClaudeChat:
    def __init__(
        self,
        system: str = "",
        model: str = "claude-opus-4-5",
        max_tokens: int = 1024,
        temperature: float = 1.0,
    ):
        self.system = system
        self.model = model
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.history: list[dict] = []
        self.total_input_tokens = 0
        self.total_output_tokens = 0

    def send(self, text: str) -> MessageResult:
        self.history.append({"role": "user", "content": text})

        kwargs = {
            "model": self.model,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
            "messages": self.history,
        }
        if self.system:
            kwargs["system"] = self.system

        msg = client.messages.create(**kwargs)

        result = MessageResult(
            text=msg.content[0].text,
            stop_reason=msg.stop_reason,
            input_tokens=msg.usage.input_tokens,
            output_tokens=msg.usage.output_tokens,
        )

        self.history.append({"role": "assistant", "content": result.text})
        self.total_input_tokens += result.input_tokens
        self.total_output_tokens += result.output_tokens

        if not result.is_complete:
            print(f"Warning: stop_reason={result.stop_reason}")

        return result

    def get_cost_summary(self) -> dict:
        return {
            "total_input_tokens": self.total_input_tokens,
            "total_output_tokens": self.total_output_tokens,
            "estimated_cost_usd": (
                self.total_input_tokens * 0.000003 +
                self.total_output_tokens * 0.000015
            )
        }


if __name__ == "__main__":
    chat = ClaudeChat(
        system="あなたはPythonチューターです。コード例を必ず含めて答えてください。"
    )

    questions = [
        "リスト内包表記とは？",
        "さっきの例をジェネレータに書き換えてください",
    ]

    for q in questions:
        result = chat.send(q)
        print(f"Q: {q}")
        print(f"A: {result.text[:200]}...\n")

    print("コストサマリー:", chat.get_cost_summary())
```

## クイズ

<!-- QUIZ:START -->
**Q1. `stop_reason: "max_tokens"`のレスポンスを受け取った時の適切な対処はどれですか？**

- A) 問題ないので無視する
- B) 出力が不完全な可能性があるため、max_tokensを増やして再実行するか警告を出す
- C) エラーとして例外を投げる
- D) 自動的に再実行する

**正解: B**
**解説:** `max_tokens`は生成が途中で打ち切られたことを意味します。出力が不完全な可能性があるため、警告を出し、必要に応じてmax_tokensを増やして再実行します。

**Q2. `stop_sequences`パラメータの用途として最も適切なものはどれですか？**

- A) APIキーを保護する
- B) 特定の文字列（タグの閉じタグなど）が生成されたら出力を終了させる
- C) 入力を制限する
- D) モデルを選択する

**正解: B**
**解説:** `stop_sequences`は指定した文字列が出力に含まれた時点で生成を停止します。`</result>`などのタグで構造化された出力を制御するときに便利です。

**Q3. `metadata`パラメータの主な用途はどれですか？**

- A) モデルの動作を変える
- B) ユーザーIDを送信してレート制限管理・不正利用検知に活用する
- C) 出力形式を指定する
- D) コストを削減する

**正解: B**
**解説:** `metadata`（主に`user_id`）を送ることで、Anthropicのシステムがユーザーごとのレート制限管理や不正利用パターンの検知を行えるようになります。
<!-- QUIZ:END -->

## まとめ

- Messages APIはmodel/max_tokens/messagesが必須パラメータ
- stop_sequencesで構造化出力の境界を制御できる
- stop_reasonは必ず確認し、max_tokensによる打ち切りを検出する
- metadataでユーザー追跡・不正利用対策を実装できる

## 次のレッスン

次のレッスンでは、OpenAI APIとClaude APIの違い・互換性・移行方法を学び、マルチプロバイダー対応のアーキテクチャを設計します。
