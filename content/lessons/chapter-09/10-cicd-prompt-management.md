---
title: "CI/CDとプロンプト管理"
chapter: 9
chapterTitle: "AI開発のアーキテクチャ設計"
lessonNumber: 10
slug: "cicd-prompt-management"
duration: 20
difficulty: "intermediate"
hasHandsOn: true
hasQuiz: true
---

## 概要

プロンプトはコードと同様にバージョン管理・レビュー・テスト・デプロイのサイクルが必要です。プロンプトをGitで管理し、評価パイプラインを自動化するCI/CD設計を学びます。

## 本文

### プロンプトをコードとして管理する

```mermaid
graph LR
    A[プロンプト変更] --> B[Gitにコミット]
    B --> C[Pull Request]
    C --> D[自動評価\nCI]
    D --> E{評価通過?}
    E -->|Yes| F[ステージングデプロイ]
    E -->|No| G[PRを修正]
    F --> H[人間レビュー]
    H --> I[本番デプロイ]
```

### プロンプトのディレクトリ構成

```
prompts/
  chat/
    system.v1.0.txt      # プロンプトファイル
    system.v1.1.txt
    system.v2.0.txt      # 現行バージョン
  summarization/
    system.v1.0.txt
  config.yaml            # どのバージョンを使うか設定
```

```yaml
# prompts/config.yaml
production:
  chat_system: "v2.0"
  summarization_system: "v1.0"

staging:
  chat_system: "v2.1-beta"
  summarization_system: "v1.0"
```

### プロンプトレジストリの実装

```python
import os
from pathlib import Path
import yaml

class PromptRegistry:
    """環境別のプロンプト管理"""

    def __init__(self, prompts_dir: str = "prompts"):
        self.prompts_dir = Path(prompts_dir)
        self.config = self._load_config()
        self._cache: dict[str, str] = {}

    def _load_config(self) -> dict:
        """設定ファイルを読み込む"""
        config_path = self.prompts_dir / "config.yaml"
        if config_path.exists():
            with open(config_path) as f:
                return yaml.safe_load(f)
        return {"production": {}, "staging": {}}

    def get(
        self,
        prompt_name: str,
        env: str = "production",
        variables: dict | None = None
    ) -> str:
        """プロンプトを取得（環境ごとのバージョン）"""
        # 設定からバージョンを取得
        version = self.config.get(env, {}).get(prompt_name, "latest")
        cache_key = f"{prompt_name}:{version}"

        if cache_key not in self._cache:
            # ファイルからプロンプトを読み込む
            category = prompt_name.replace("_system", "")
            file_path = self.prompts_dir / category / f"system.{version}.txt"

            if file_path.exists():
                with open(file_path) as f:
                    self._cache[cache_key] = f.read()
            else:
                # ファイルがない場合はデフォルトを使用
                self._cache[cache_key] = f"[{prompt_name} v{version} not found]"

        prompt = self._cache[cache_key]

        # 変数を置換
        if variables:
            for key, value in variables.items():
                prompt = prompt.replace(f"{{{{{key}}}}}", str(value))

        return prompt

    def list_versions(self, prompt_name: str) -> list[str]:
        """利用可能なバージョン一覧"""
        category = prompt_name.replace("_system", "")
        pattern = f"system.*.txt"
        files = (self.prompts_dir / category).glob(pattern)
        return sorted([f.stem.replace("system.", "") for f in files])


# 使用例（ファイルシステムなしのデモ）
class MockPromptRegistry:
    """テスト用のモックレジストリ"""

    def __init__(self):
        self._prompts = {
            "chat_system:v1.0": "You are a helpful assistant. Answer in Japanese.",
            "chat_system:v2.0": "あなたは親切なAIアシスタントです。簡潔・丁寧に回答してください。",
            "summarization_system:v1.0": "以下の文書を要約してください。",
        }
        self.config = {
            "production": {"chat_system": "v2.0", "summarization_system": "v1.0"},
            "staging": {"chat_system": "v2.1-beta"},
        }

    def get(self, prompt_name: str, env: str = "production") -> str:
        version = self.config.get(env, {}).get(prompt_name, "v1.0")
        return self._prompts.get(f"{prompt_name}:{version}", "[Not found]")

registry = MockPromptRegistry()
print("本番環境のプロンプト:", registry.get("chat_system", "production")[:50])
print("ステージング環境:", registry.get("chat_system", "staging"))
```

### GitHub ActionsによるCI/CDパイプライン

```yaml
# .github/workflows/prompt-ci.yml
name: Prompt Evaluation CI

on:
  pull_request:
    paths:
      - 'prompts/**'

jobs:
  evaluate-prompts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: pip install anthropic pytest

      - name: Run prompt evaluations
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          python scripts/evaluate_prompts.py \
            --changed-only \
            --output-json eval_results.json

      - name: Check pass rate
        run: |
          python scripts/check_eval_results.py \
            --results eval_results.json \
            --min-pass-rate 0.85

      - name: Comment PR with results
        uses: actions/github-script@v7
        if: always()
        with:
          script: |
            const results = require('./eval_results.json')
            const body = `## プロンプト評価結果
            - 合格率: ${(results.pass_rate * 100).toFixed(1)}%
            - テストケース数: ${results.total_cases}
            - 使用モデル: ${results.model}
            `
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: body
            })
```

### プロンプトのA/Bテストデプロイ

```python
import random
import anthropic

class PromptABDeployer:
    """プロンプトのA/Bテストデプロイ"""

    def __init__(self, registry: MockPromptRegistry):
        self.registry = registry
        self.client = anthropic.Anthropic()
        self.results = {"a": [], "b": []}

    def get_prompt_variant(self, user_id: str) -> str:
        """ユーザーIDに基づいてA/Bを決定（一貫性のため）"""
        return "a" if hash(user_id) % 2 == 0 else "b"

    def chat(self, user_id: str, message: str) -> dict:
        """A/Bテスト付きチャット"""
        variant = self.get_prompt_variant(user_id)

        # A: 現行バージョン、B: 新バージョン
        env = "production" if variant == "a" else "staging"
        system_prompt = self.registry.get("chat_system", env)

        response = self.client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=200,
            system=system_prompt,
            messages=[{"role": "user", "content": message}]
        )

        result = {
            "variant": variant,
            "answer": response.content[0].text,
            "tokens": response.usage.input_tokens + response.usage.output_tokens,
        }

        self.results[variant].append(result)
        return result

    def get_experiment_summary(self) -> dict:
        """A/B実験のサマリー"""
        def avg_tokens(results: list[dict]) -> float:
            if not results:
                return 0
            return sum(r["tokens"] for r in results) / len(results)

        return {
            "a_requests": len(self.results["a"]),
            "b_requests": len(self.results["b"]),
            "a_avg_tokens": avg_tokens(self.results["a"]),
            "b_avg_tokens": avg_tokens(self.results["b"]),
        }
```

## ハンズオン

シンプルなプロンプト管理システムを実装してみましょう。

### ステップ1：バージョン付きプロンプトの利用

```python
import anthropic
import json
from datetime import datetime

# プロンプトのバージョン管理（インメモリ版）
PROMPT_VERSIONS = {
    "v1": "あなたはアシスタントです。質問に答えてください。",
    "v2": "あなたは親切で正確なAIアシスタントです。日本語で簡潔に、かつ分かりやすく回答してください。",
}

CURRENT_VERSION = "v2"

def use_versioned_prompt(question: str, version: str = CURRENT_VERSION) -> dict:
    """バージョン管理されたプロンプトを使用"""
    client = anthropic.Anthropic()
    system_prompt = PROMPT_VERSIONS[version]

    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=150,
        system=system_prompt,
        messages=[{"role": "user", "content": question}]
    )

    return {
        "prompt_version": version,
        "question": question,
        "answer": response.content[0].text,
        "tokens": response.usage.input_tokens + response.usage.output_tokens,
        "timestamp": datetime.utcnow().isoformat(),
    }


# テスト
question = "Pythonとは何ですか？"
result = use_versioned_prompt(question)
print(f"プロンプトバージョン: {result['prompt_version']}")
print(f"回答: {result['answer'][:100]}...")
print(f"使用トークン: {result['tokens']}")
```

## クイズ

<!-- QUIZ:START -->
**Q1. プロンプトをコードと同様にGitで管理する主なメリットはどれですか？**

- A) プロンプトが自動的に改善される
- B) 変更履歴の追跡・ロールバック・チームレビューが可能になり、品質と再現性が向上する
- C) APIコストが削減される
- D) テストが不要になる

**正解: B**
**解説:** プロンプトの変更はモデルの動作に直接影響しますが、ソースコードと異なりバイナリではないため「なんとなく変更」されがちです。Gitで管理することで「誰が・いつ・なぜ」変更したかが追跡でき、問題発生時のロールバックが可能で、Pull Requestでチームレビューができます。

**Q2. CI/CDパイプラインでプロンプトを評価する目的はどれですか？**

- A) デプロイを高速化するため
- B) プロンプト変更が品質基準（合格率85%以上など）を満たすことを自動確認し、品質低下のあるプロンプトを本番に出さないため
- C) テストコードを削減するため
- D) APIキーを保護するため

**正解: B**
**解説:** プロンプトを変更すると意図しない副作用が生じることがあります（特定のカテゴリが弱くなるなど）。CIで自動評価することで、人間が手動確認しなくても品質基準を満たすことを保証できます。評価が失敗したPRは自動的にブロックされます。

**Q3. プロンプトのA/Bテストデプロイで「ユーザーIDで振り分ける」理由はどれですか？**

- A) セキュリティを向上させるため
- B) 同じユーザーが常に同じバリアントを受け取ることで体験の一貫性を保ち、正確な比較ができるから
- C) 実装が簡単だから
- D) コストを削減するため

**正解: B**
**解説:** ランダムに毎回振り分けると、同じユーザーが会話のたびに違うプロンプトを受け取り、「なぜ回答の質が変わったのか」が分からなくなります。ユーザーIDのハッシュで振り分けることで、ユーザーAは常にバリアントAを体験でき、公平な比較が可能になります。
<!-- QUIZ:END -->

## まとめ

- プロンプトはGitで管理してバージョン管理・チームレビュー・ロールバックを可能にする
- CI/CDでプロンプト変更時に自動評価を実行して品質低下を防ぐ
- 環境（本番・ステージング）ごとに異なるバージョンのプロンプトを設定する
- ユーザーIDベースのA/Bデプロイで新旧プロンプトを安全に比較検証する

## 次のレッスン

次のレッスンでは、大規模AIシステムの本番アーキテクチャ事例を学びます。
