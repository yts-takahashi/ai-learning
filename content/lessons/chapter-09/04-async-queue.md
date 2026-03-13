---
title: "非同期処理とキュー設計"
chapter: 9
chapterTitle: "AI開発のアーキテクチャ設計"
lessonNumber: 4
slug: "async-queue"
duration: 20
difficulty: "intermediate"
hasHandsOn: true
hasQuiz: true
---

## 概要

文書の大量処理・画像生成・長時間のエージェント実行など、リクエスト応答時間内に完了しない処理は非同期キューで設計します。ジョブキューの設計・ステータス管理・Webhookの実装を学びます。

## 本文

### 同期 vs 非同期の使い分け

```mermaid
graph TD
    A[リクエスト] --> B{処理時間?}
    B -->|< 30秒| C[同期処理\nリクエスト内で完結]
    B -->|> 30秒| D[非同期処理\nジョブキュー]

    D --> E[ジョブID返却]
    D --> F[バックグラウンドで処理]
    F --> G{完了通知方法}
    G --> H[ポーリング\nGET /jobs/{id}]
    G --> I[Webhook\nコールバック]
```

### 非同期パターンの実装

```python
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime
import asyncio
import uuid
import anthropic

class JobStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class Job:
    id: str
    type: str
    payload: dict
    status: JobStatus = JobStatus.PENDING
    result: str | None = None
    error: str | None = None
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    completed_at: str | None = None
    progress: int = 0  # 0-100

class JobQueue:
    """シンプルなジョブキュー（本番はRedis/SQS/Celeryを使用）"""

    def __init__(self):
        self.jobs: dict[str, Job] = {}
        self.queue: asyncio.Queue = asyncio.Queue()

    def submit(self, job_type: str, payload: dict) -> str:
        """ジョブをキューに追加"""
        job_id = str(uuid.uuid4())
        job = Job(id=job_id, type=job_type, payload=payload)
        self.jobs[job_id] = job
        asyncio.create_task(self.queue.put(job))
        return job_id

    def get_status(self, job_id: str) -> Job | None:
        """ジョブのステータスを取得"""
        return self.jobs.get(job_id)

    async def worker(self):
        """ジョブを処理するワーカー"""
        client = anthropic.Anthropic()

        while True:
            job = await self.queue.get()

            try:
                job.status = JobStatus.RUNNING

                if job.type == "document_analysis":
                    result = await self._process_document(client, job.payload)
                elif job.type == "batch_translation":
                    result = await self._process_batch_translation(client, job.payload)
                else:
                    raise ValueError(f"Unknown job type: {job.type}")

                job.status = JobStatus.COMPLETED
                job.result = result
                job.completed_at = datetime.utcnow().isoformat()
                job.progress = 100

            except Exception as e:
                job.status = JobStatus.FAILED
                job.error = str(e)
                job.completed_at = datetime.utcnow().isoformat()

            finally:
                self.queue.task_done()

    async def _process_document(self, client: anthropic.Anthropic, payload: dict) -> str:
        """文書分析の処理"""
        document = payload.get("document", "")
        question = payload.get("question", "この文書を要約してください")

        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=2048,
            messages=[{
                "role": "user",
                "content": f"以下の文書について答えてください。\n\n{document}\n\n質問: {question}"
            }]
        )
        return response.content[0].text

    async def _process_batch_translation(
        self, client: anthropic.Anthropic, payload: dict
    ) -> str:
        """バッチ翻訳の処理"""
        texts = payload.get("texts", [])
        target_lang = payload.get("target_language", "日本語")
        results = []

        for i, text in enumerate(texts):
            response = client.messages.create(
                model="claude-haiku-4-5",  # 翻訳は軽量モデルで十分
                max_tokens=500,
                messages=[{
                    "role": "user",
                    "content": f"以下を{target_lang}に翻訳してください：\n{text}"
                }]
            )
            results.append(response.content[0].text)

        return "\n---\n".join(results)
```

### FastAPIとの統合

```python
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel

app = FastAPI()
job_queue = JobQueue()

class DocumentAnalysisRequest(BaseModel):
    document: str
    question: str = "要約してください"
    webhook_url: str | None = None

@app.on_event("startup")
async def startup():
    """起動時にワーカーを開始"""
    asyncio.create_task(job_queue.worker())

@app.post("/jobs/document-analysis")
async def submit_document_analysis(request: DocumentAnalysisRequest):
    """文書分析ジョブを非同期で投入"""
    job_id = job_queue.submit("document_analysis", {
        "document": request.document,
        "question": request.question,
        "webhook_url": request.webhook_url,
    })

    return {
        "job_id": job_id,
        "status": "pending",
        "polling_url": f"/jobs/{job_id}/status",
    }

@app.get("/jobs/{job_id}/status")
async def get_job_status(job_id: str):
    """ジョブのステータスを取得（ポーリング用）"""
    job = job_queue.get_status(job_id)
    if not job:
        return {"error": "Job not found"}, 404

    response = {
        "job_id": job.id,
        "status": job.status.value,
        "progress": job.progress,
        "created_at": job.created_at,
    }

    if job.status == JobStatus.COMPLETED:
        response["result"] = job.result
        response["completed_at"] = job.completed_at
    elif job.status == JobStatus.FAILED:
        response["error"] = job.error

    return response
```

### Webhookによる完了通知

```python
import httpx

async def send_webhook(webhook_url: str, job: Job):
    """ジョブ完了をWebhookで通知"""
    payload = {
        "event": "job.completed" if job.status == JobStatus.COMPLETED else "job.failed",
        "job_id": job.id,
        "status": job.status.value,
        "result": job.result,
        "error": job.error,
        "completed_at": job.completed_at,
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                webhook_url,
                json=payload,
                timeout=10.0
            )
            response.raise_for_status()
        except Exception as e:
            print(f"Webhook配信失敗: {e}")
            # 再試行ロジックを実装（指数バックオフ）
```

## ハンズオン

非同期バッチ処理APIを実装してみましょう。

### ステップ1：バッチ文書要約システム

```python
import asyncio
from dataclasses import dataclass
import anthropic

@dataclass
class BatchJob:
    id: str
    documents: list[str]
    summaries: list[str | None]
    completed: int = 0

async def batch_summarize(documents: list[str], max_concurrency: int = 3) -> list[str]:
    """複数文書を並列で要約"""
    client = anthropic.Anthropic()
    semaphore = asyncio.Semaphore(max_concurrency)
    summaries = [None] * len(documents)

    async def summarize_one(index: int, document: str):
        async with semaphore:
            # asyncioでスレッドプールを使った同期APIの呼び出し
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: client.messages.create(
                    model="claude-haiku-4-5",
                    max_tokens=200,
                    messages=[{"role": "user", "content": f"以下を3文で要約してください：\n{document}"}]
                )
            )
            summaries[index] = response.content[0].text
            print(f"  [{index+1}/{len(documents)}] 完了")

    tasks = [summarize_one(i, doc) for i, doc in enumerate(documents)]
    await asyncio.gather(*tasks)
    return summaries

# テスト
async def main():
    documents = [
        "機械学習はデータからパターンを学習するアルゴリズムです...",
        "ディープラーニングは神経網を使った機械学習の手法です...",
        "強化学習はエージェントが環境と相互作用して学習します...",
    ]

    print(f"{len(documents)}件の文書を並列処理中...")
    summaries = await batch_summarize(documents, max_concurrency=3)
    print("\n要約結果:")
    for i, summary in enumerate(summaries):
        print(f"  [{i+1}] {summary[:80] if summary else 'None'}...")

# asyncio.run(main())
print("非同期バッチ処理の実装例 - asyncio.run(main())で実行")
```

## クイズ

<!-- QUIZ:START -->
**Q1. 非同期キュー処理が適しているのはどのケースですか？**

- A) 0.1秒で完了する軽いリクエスト
- B) 数分かかる大量文書の処理や長時間のエージェント実行
- C) リアルタイムチャットの応答
- D) ユーザー認証の確認

**正解: B**
**解説:** HTTPリクエストのタイムアウトは通常30秒〜数分です。大量文書の処理・複数ステップのエージェント実行・バッチ翻訳など、長時間かかる処理はキューに投入してバックグラウンドで実行し、ジョブIDでステータスを追跡するパターンが適しています。

**Q2. ジョブの完了をクライアントに通知する2つの方法はどれですか？**

- A) ログファイルへの書き込みとメールへの通知
- B) ポーリング（GET /jobs/{id}/statusを定期実行）とWebhook（完了時にコールバック）
- C) WebSocketとgRPC
- D) SSEとLong Polling

**正解: B**
**解説:** ポーリングはクライアントが定期的にステータスを確認する方法（シンプルだがリクエストが増える）。Webhookはジョブ完了時にサーバー側からコールバックURLに通知する方法（効率的だがクライアント側にHTTPサーバーが必要）。両方を提供するAPIが理想的です。

**Q3. バッチ処理で `Semaphore` を使う目的はどれですか？**

- A) 処理を順番に実行させる
- B) 同時に実行する処理の最大数を制限してAPIのレートリミットを超えないようにする
- C) エラーハンドリングを簡単にする
- D) メモリ使用量を削減する

**正解: B**
**解説:** `asyncio.Semaphore(n)` は最大n個の非同期タスクが同時に実行されるよう制限します。LLM APIのレートリミット（例: 50 req/min）を超えないよう並列数を制限しながら、逐次処理より高速なバッチ処理を実現します。
<!-- QUIZ:END -->

## まとめ

- 30秒以上かかる処理は非同期キューに投入してバックグラウンドで実行する
- ジョブIDを返却し、ポーリングまたはWebhookで完了を通知する
- Semaphoreで並列数を制限してAPIのレートリミットを遵守する
- 本番ではRedis（Bull等）・SQS・Celeryなどのキューシステムを使用する

## 次のレッスン

次のレッスンでは、AIシステムの水平スケーリング・ロードバランシング・マルチリージョン設計を学びます。
