---
title: "トークン管理とコスト最適化"
chapter: 2
chapterTitle: "API活用"
lessonNumber: 9
slug: "token-management"
duration: 30
difficulty: "intermediate"
hasHandsOn: true
hasQuiz: true
---

## 概要

LLM APIのコストはトークン数で決まります。トークンの計算方法・削減テクニック・プロンプトキャッシュの活用方法を学び、APIコストを大幅に削減します。

## 本文

### トークンとは

トークンは言語モデルが処理する最小単位です。文字でも単語でもなく、その中間の概念です。

```
"Hello World" → ["Hello", " World"] → 2トークン
"こんにちは" → ["こん", "にち", "は"] → 約3〜5トークン（日本語は英語より多い）
```

**目安：**
- 英語: 1トークン ≈ 4文字
- 日本語: 1トークン ≈ 1〜2文字
- 1000トークン ≈ 750英語単語

### コスト計算

```python
# Claude claude-opus-4-5の料金（2024年時点の概算）
PRICING = {
    "claude-opus-4-5": {
        "input": 0.000003,   # $3 per 1M tokens
        "output": 0.000015,  # $15 per 1M tokens
    },
    "claude-sonnet-4-5": {
        "input": 0.000003,
        "output": 0.000015,
    },
    "claude-haiku-3-5": {
        "input": 0.00000025,  # $0.25 per 1M tokens
        "output": 0.00000125, # $1.25 per 1M tokens
    }
}

def estimate_cost(
    input_tokens: int,
    output_tokens: int,
    model: str = "claude-opus-4-5"
) -> float:
    prices = PRICING.get(model, PRICING["claude-opus-4-5"])
    return (input_tokens * prices["input"] +
            output_tokens * prices["output"])
```

### トークン数の事前計算

```python
import anthropic

client = anthropic.Anthropic()

def count_tokens(messages: list[dict], system: str = "") -> int:
    """実際のAPI呼び出し前にトークン数を計算"""
    response = client.messages.count_tokens(
        model="claude-opus-4-5",
        system=system,
        messages=messages
    )
    return response.input_tokens
```

### コスト削減テクニック

#### テクニック1：モデル選択の最適化

```python
def select_model(task_complexity: str) -> str:
    """タスクの複雑さに応じてモデルを選択"""
    model_map = {
        "simple": "claude-haiku-3-5",    # 分類・短文生成
        "medium": "claude-sonnet-4-5",   # 中程度の推論
        "complex": "claude-opus-4-5",    # 複雑な推論・長文
    }
    return model_map.get(task_complexity, "claude-sonnet-4-5")
```

#### テクニック2：プロンプトキャッシュ

同じSystemプロンプトや長文ドキュメントを繰り返し使う場合：

```python
# キャッシュを有効にする（最初の呼び出しでキャッシュ作成）
message = client.messages.create(
    model="claude-opus-4-5",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": "あなたは専門家です...",  # 長いSystemプロンプト
            "cache_control": {"type": "ephemeral"}  # キャッシュ指定
        }
    ],
    messages=[{"role": "user", "content": "質問"}]
)

# キャッシュ利用状況の確認
print(f"キャッシュ作成: {message.usage.cache_creation_input_tokens}")
print(f"キャッシュ読込: {message.usage.cache_read_input_tokens}")
# キャッシュ読込は通常の入力トークンより約90%安い
```

#### テクニック3：max_tokensの最適化

```python
# タスク別の適切なmax_tokens
TOKEN_LIMITS = {
    "classification": 20,      # ラベルのみ
    "boolean": 5,              # はい/いいえ
    "short_answer": 100,       # 短い回答
    "summary": 500,            # 要約
    "explanation": 1000,       # 説明
    "code_generation": 2000,   # コード生成
    "long_form": 4000,         # 長文生成
}
```

#### テクニック4：プロンプトの圧縮

```python
def compress_prompt(long_prompt: str) -> str:
    """AIを使ってプロンプト自体を圧縮"""
    compression_prompt = f"""以下のプロンプトを、意味と指示を保ちながら
できるだけ短く書き直してください：

{long_prompt}

圧縮されたプロンプトのみ返してください。"""

    # Haikuモデルで圧縮（安価・高速）
    msg = client.messages.create(
        model="claude-haiku-3-5",
        max_tokens=1024,
        messages=[{"role": "user", "content": compression_prompt}]
    )
    return msg.content[0].text
```

## ハンズオン

コスト追跡ダッシュボードを実装します。

### 完成コード

```python
import anthropic
from dataclasses import dataclass, field
from datetime import datetime
from collections import defaultdict

PRICING = {
    "claude-opus-4-5":    {"input": 3.0,   "output": 15.0},   # $ per 1M tokens
    "claude-sonnet-4-5":  {"input": 3.0,   "output": 15.0},
    "claude-haiku-3-5":   {"input": 0.25,  "output": 1.25},
}

@dataclass
class APICall:
    model: str
    input_tokens: int
    output_tokens: int
    timestamp: datetime = field(default_factory=datetime.now)
    task_type: str = "default"

    @property
    def cost_usd(self) -> float:
        p = PRICING.get(self.model, PRICING["claude-opus-4-5"])
        return (self.input_tokens * p["input"] + self.output_tokens * p["output"]) / 1_000_000


class CostTracker:
    def __init__(self):
        self.calls: list[APICall] = []
        self._client = anthropic.Anthropic()

    def track_call(self, call: APICall):
        self.calls.append(call)

    def complete(
        self,
        messages: list[dict],
        model: str = "claude-opus-4-5",
        max_tokens: int = 1024,
        system: str = "",
        task_type: str = "default",
    ) -> str:
        kwargs = {"model": model, "max_tokens": max_tokens, "messages": messages}
        if system:
            kwargs["system"] = system

        msg = self._client.messages.create(**kwargs)

        self.track_call(APICall(
            model=model,
            input_tokens=msg.usage.input_tokens,
            output_tokens=msg.usage.output_tokens,
            task_type=task_type,
        ))

        return msg.content[0].text

    def get_summary(self) -> dict:
        if not self.calls:
            return {"total_calls": 0, "total_cost_usd": 0.0}

        by_model = defaultdict(lambda: {"calls": 0, "cost": 0.0, "input_tokens": 0, "output_tokens": 0})
        for call in self.calls:
            by_model[call.model]["calls"] += 1
            by_model[call.model]["cost"] += call.cost_usd
            by_model[call.model]["input_tokens"] += call.input_tokens
            by_model[call.model]["output_tokens"] += call.output_tokens

        return {
            "total_calls": len(self.calls),
            "total_cost_usd": sum(c.cost_usd for c in self.calls),
            "by_model": dict(by_model),
        }


if __name__ == "__main__":
    tracker = CostTracker()

    # 複数の呼び出しをトラッキング
    tracker.complete(
        messages=[{"role": "user", "content": "Pythonとは？"}],
        model="claude-haiku-3-5",
        max_tokens=100,
        task_type="qa",
    )

    summary = tracker.get_summary()
    print(f"合計コール数: {summary['total_calls']}")
    print(f"合計コスト: ${summary['total_cost_usd']:.6f}")
    for model, stats in summary["by_model"].items():
        print(f"  {model}: {stats['calls']}回 / ${stats['cost']:.6f}")
```

## クイズ

<!-- QUIZ:START -->
**Q1. 日本語テキストが英語テキストより多くのトークンを使用する理由は何ですか？**

- A) 日本語はAPIに対応していない
- B) トークナイザーが日本語を英語より細かく分割するため
- C) 日本語ファイルはファイルサイズが大きい
- D) 文字コードの問題

**正解: B**
**解説:** LLMのトークナイザーは主に英語向けに設計されているため、日本語は1〜2文字で1トークンになることが多く、英語の4文字/トークンより多くのトークンを消費します。

**Q2. プロンプトキャッシュ（Prompt Caching）の主なメリットはどれですか？**

- A) APIキーが不要になる
- B) 同じ長いプロンプト（Systemプロンプト等）を繰り返し使う場合のコストを最大90%削減できる
- C) 出力品質が向上する
- D) レートリミットがなくなる

**正解: B**
**解説:** プロンプトキャッシュを使うと、キャッシュされたトークンの読み込みコストが通常の入力トークンコストより約90%安くなります。同じSystemプロンプトや長い文書を繰り返し使う場合に特に効果的です。

**Q3. コスト最適化として「タスクの複雑さに応じてモデルを選択する」のが重要な理由は何ですか？**

- A) 同じタスクにOpusを使い続けるべきだから
- B) シンプルタスクにHaikuを使うと品質は維持しながらコストを大幅削減できるから
- C) モデル選択はコストに影響しないから
- D) Haikuは常に品質が低いから

**正解: B**
**解説:** 分類や短文生成などのシンプルなタスクはHaikuで十分な品質が得られます。Claude claude-opus-4-5とHaikuでは1M入力トークンあたり12倍以上のコスト差があるため、タスクに合わせたモデル選択が重要です。
<!-- QUIZ:END -->

## まとめ

- トークンはAPIコストの基本単位。日本語は英語の2〜3倍のトークンを消費する
- プロンプトキャッシュで同一Systemプロンプトのコストを最大90%削減
- タスク複雑さに応じてモデルを選択し不要なコストを避ける
- CostTrackerで使用量を可視化して最適化ポイントを発見する

## 次のレッスン

次のレッスンでは、多数のプロンプトを効率よく処理する「バッチ処理と並列実行」を学びます。
