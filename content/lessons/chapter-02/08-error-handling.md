---
title: "エラーハンドリングとリトライ"
chapter: 2
chapterTitle: "API活用"
lessonNumber: 8
slug: "error-handling"
duration: 30
difficulty: "intermediate"
hasHandsOn: true
hasQuiz: true
---

## 概要

本番環境でのAPIエラーは必ず発生します。レート制限・ネットワーク問題・タイムアウトなどに対して適切な指数バックオフリトライ・フォールバック・サーキットブレーカーを実装する方法を学びます。

## 本文

### Anthropic SDKの例外階層

```
anthropic.APIError
├── anthropic.AuthenticationError  (401) - APIキー無効
├── anthropic.PermissionDeniedError (403) - 権限なし
├── anthropic.NotFoundError         (404) - リソースなし
├── anthropic.RateLimitError        (429) - レート制限
├── anthropic.APIStatusError        (4xx/5xx) - その他
└── anthropic.APIConnectionError    - ネットワークエラー
```

### エラー別の対処方針

| エラー | 対処 |
|--------|------|
| AuthenticationError | 即失敗（リトライ不要） |
| RateLimitError | 指数バックオフでリトライ |
| APIConnectionError | リトライ |
| 500系 | リトライ |

### 指数バックオフリトライ

```python
import time
import random
import anthropic

def exponential_backoff_retry(
    fn,
    max_retries: int = 3,
    initial_wait: float = 1.0,
    multiplier: float = 2.0,
    jitter: bool = True
):
    """指数バックオフリトライデコレータ"""
    RETRYABLE_ERRORS = (
        anthropic.RateLimitError,
        anthropic.APIConnectionError,
        anthropic.InternalServerError,
    )

    last_error = None
    for attempt in range(max_retries + 1):
        try:
            return fn()
        except RETRYABLE_ERRORS as e:
            last_error = e
            if attempt == max_retries:
                raise

            wait = initial_wait * (multiplier ** attempt)
            if jitter:
                wait *= (0.5 + random.random())  # ±50%のジッター

            print(f"リトライ {attempt + 1}/{max_retries}: {wait:.1f}秒待機中...")
            time.sleep(wait)
        except (anthropic.AuthenticationError, anthropic.PermissionDeniedError):
            raise  # 認証エラーはリトライしない

    raise last_error
```

### デコレータパターン

```python
import functools
from typing import TypeVar, Callable

F = TypeVar("F", bound=Callable)

def with_retry(max_retries: int = 3):
    def decorator(func: F) -> F:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            return exponential_backoff_retry(
                lambda: func(*args, **kwargs),
                max_retries=max_retries
            )
        return wrapper
    return decorator

@with_retry(max_retries=3)
def call_claude(prompt: str) -> str:
    client = anthropic.Anthropic()
    msg = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )
    return msg.content[0].text
```

### サーキットブレーカーパターン

連続失敗時にAPIコールを一時停止して過負荷を防ぐ：

```python
from enum import Enum
from datetime import datetime, timedelta

class CircuitState(Enum):
    CLOSED = "closed"       # 正常（APIを呼ぶ）
    OPEN = "open"           # 遮断中（APIを呼ばない）
    HALF_OPEN = "half_open" # テスト中（1回だけ試す）

class CircuitBreaker:
    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: int = 60
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.state = CircuitState.CLOSED
        self.last_failure: datetime | None = None

    def call(self, fn):
        if self.state == CircuitState.OPEN:
            if datetime.now() - self.last_failure > timedelta(seconds=self.recovery_timeout):
                self.state = CircuitState.HALF_OPEN
            else:
                raise Exception("Circuit is OPEN: APIコールを拒否しています")

        try:
            result = fn()
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise

    def _on_success(self):
        self.failure_count = 0
        self.state = CircuitState.CLOSED

    def _on_failure(self):
        self.failure_count += 1
        self.last_failure = datetime.now()
        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN
```

## ハンズオン

本番品質のAPIクライアントを実装します。

### 完成コード

```python
import time
import random
import logging
from datetime import datetime, timedelta
from enum import Enum
from typing import Callable, TypeVar
import anthropic

logger = logging.getLogger(__name__)

T = TypeVar("T")

RETRYABLE_ERRORS = (
    anthropic.RateLimitError,
    anthropic.APIConnectionError,
    anthropic.InternalServerError,
)
NON_RETRYABLE_ERRORS = (
    anthropic.AuthenticationError,
    anthropic.PermissionDeniedError,
    anthropic.BadRequestError,
)


def retry_with_backoff(
    fn: Callable[[], T],
    max_retries: int = 3,
    initial_wait: float = 1.0,
) -> T:
    for attempt in range(max_retries + 1):
        try:
            return fn()
        except NON_RETRYABLE_ERRORS:
            raise
        except RETRYABLE_ERRORS as e:
            if attempt == max_retries:
                raise
            wait = initial_wait * (2 ** attempt) * (0.5 + random.random())
            logger.warning(f"Retry {attempt+1}/{max_retries} in {wait:.1f}s: {e}")
            time.sleep(wait)


class ProductionClaudeClient:
    def __init__(
        self,
        model: str = "claude-opus-4-5",
        max_retries: int = 3,
        failure_threshold: int = 5,
        recovery_timeout: int = 60,
    ):
        self._client = anthropic.Anthropic()
        self.model = model
        self.max_retries = max_retries
        # サーキットブレーカー状態
        self._failure_count = 0
        self._failure_threshold = failure_threshold
        self._recovery_timeout = recovery_timeout
        self._last_failure: datetime | None = None
        self._circuit_open = False

    def _check_circuit(self):
        if not self._circuit_open:
            return
        if (self._last_failure and
                datetime.now() - self._last_failure > timedelta(seconds=self._recovery_timeout)):
            logger.info("Circuit half-open: testing...")
            self._circuit_open = False
        else:
            raise Exception("Circuit OPEN: APIを一時停止中")

    def _record_failure(self):
        self._failure_count += 1
        self._last_failure = datetime.now()
        if self._failure_count >= self._failure_threshold:
            self._circuit_open = True
            logger.error("Circuit OPEN: 連続失敗が閾値を超えました")

    def _record_success(self):
        self._failure_count = 0
        self._circuit_open = False

    def complete(self, messages: list[dict], system: str = "", max_tokens: int = 1024) -> str:
        self._check_circuit()

        def _call():
            kwargs = {
                "model": self.model,
                "max_tokens": max_tokens,
                "messages": messages,
            }
            if system:
                kwargs["system"] = system
            return self._client.messages.create(**kwargs)

        try:
            response = retry_with_backoff(_call, max_retries=self.max_retries)
            self._record_success()
            return response.content[0].text
        except Exception as e:
            self._record_failure()
            raise


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    client = ProductionClaudeClient()

    try:
        result = client.complete(
            messages=[{"role": "user", "content": "Hello!"}],
            system="簡潔に答えてください"
        )
        print(result)
    except anthropic.AuthenticationError:
        print("APIキーが無効です。環境変数を確認してください。")
    except Exception as e:
        print(f"エラー: {e}")
```

## クイズ

<!-- QUIZ:START -->
**Q1. `RateLimitError`（429）に対する最適な対処はどれですか？**

- A) 即座に再試行する
- B) 指数バックオフ（待機時間を指数的に増加）でリトライする
- C) エラーを無視して処理を続ける
- D) APIキーを変更する

**正解: B**
**解説:** RateLimitError時に即座にリトライするとさらにレート制限を悪化させます。指数バックオフ（1秒→2秒→4秒等）で待機時間を増やすことで、レート制限が解除された後に適切にリトライできます。

**Q2. サーキットブレーカーパターンの主な目的は何ですか？**

- A) APIコストを削減する
- B) 連続失敗時にAPIコールを一時停止して過負荷を防ぎ、回復を待つ
- C) レスポンスを速くする
- D) セキュリティを向上させる

**正解: B**
**解説:** サーキットブレーカーはAPIが障害状態の時に連続的なAPIコールを防ぎます。一定回数失敗したら「OPEN」状態になりAPIコールを拒否し、一定時間後に「HALF_OPEN」でテストして回復を確認します。

**Q3. 指数バックオフに「ジッター（ランダム性）」を加える理由は何ですか？**

- A) セキュリティ向上
- B) 複数のクライアントが同時にリトライして再度レート制限に引っかかる「雷群れ問題」を防ぐ
- C) コスト削減
- D) ランダム性は不要で加えるべきではない

**正解: B**
**解説:** ジッターなしだと複数のクライアントが同じタイミングでリトライし、再度レート制限に引っかかります（雷群れ問題）。ランダムなジッターを加えることでリトライのタイミングを分散できます。
<!-- QUIZ:END -->

## まとめ

- Anthropic SDKの例外階層を理解し、リトライ可能/不可能なエラーを区別する
- 指数バックオフ+ジッターでレート制限エラーを適切に処理する
- サーキットブレーカーで連続失敗時の過負荷を防ぐ
- 本番クライアントは認証エラーのような即時失敗すべきケースも処理する

## 次のレッスン

次のレッスンでは、トークンの計算方法とコストを最小化する「トークン管理とコスト最適化」を学びます。
