---
title: "悪いプロンプトと良いプロンプト"
chapter: 1
chapterTitle: "プロンプトエンジニアリング"
lessonNumber: 11
slug: "good-vs-bad-prompt"
duration: 20
difficulty: "beginner"
hasHandsOn: true
hasQuiz: true
---

## 概要

実務でよく出くわす「悪いプロンプト」のパターンとその改善例を学びます。ビフォーアフター形式で具体的に示すことで、プロンプト品質を即座に判断できる感覚を身に付けます。

## 本文

### 悪いプロンプトの7つのパターン

#### パターン1：曖昧な指示

```
# 悪い
「コードを改善して」

# 良い
「以下のPythonコードのパフォーマンスを改善してください。
具体的には：O(n²)以上の計算量を持つ箇所をO(n log n)以下に改善し、
変更箇所にコメントで理由を追記してください。」
```

#### パターン2：出力形式の未指定

```
# 悪い
「このエラーの原因と解決策を教えて」

# 良い
「以下のエラーについて：
## 原因（1〜2文）
## 解決手順（番号付きリスト）
## 予防策（箇条書き）
の形式で答えてください。」
```

#### パターン3：コンテキスト不足

```
# 悪い
「これのテストを書いて」

# 良い
「以下のPython関数（pytest使用、Python 3.11、型ヒント必須）の
単体テストを書いてください。正常系2ケース・異常系2ケースを含めること。」
```

#### パターン4：過剰な礼儀・無駄な前置き

```
# 悪い（トークン無駄遣い）
「お忙しいところ恐れ入りますが、もしよろしければ以下について
教えていただけると大変嬉しいのですが...」

# 良い
「以下について教えてください：」
```

#### パターン5：否定形だけの制約

```
# 悪い
「難しい言葉を使わないで」

# 良い
「高校生でも理解できる平易な言葉で説明してください。
専門用語は使う場合、必ず括弧内で簡単な説明を付けてください。」
```

#### パターン6：複数タスクの混在

```
# 悪い
「このコードをレビューして、テストも書いて、ドキュメントも更新して」

# 良い（タスクを分ける）
# リクエスト1：コードレビュー
# リクエスト2：テスト作成
# リクエスト3：ドキュメント更新
```

#### パターン7：事実確認の欠如

```
# 悪い（ハルシネーションを誘発）
「React 19の新機能を全部教えて」

# 良い
「React 19の公式リリースノートに基づいて新機能を教えてください。
不確かな情報は「確認が必要」と明記してください。」
```

### プロンプト品質チェックリスト

```
□ 指示は具体的な動詞で始まっているか？
□ 出力形式が明確に指定されているか？
□ 対象・目的・制約のコンテキストがあるか？
□ 不要な礼儀・前置きを省いているか？
□ 1つのプロンプトに1つのタスクになっているか？
□ 「〜しないで」は「〜してください」に変えているか？
□ 事実確認が必要な場合、確認指示が入っているか？
```

### ビフォーアフター：実務ケース

#### ケース1：コードレビュー依頼

```
# Before（悪い）
「このコードどうですか？」

# After（良い）
あなたはGo言語のシニアエンジニアです。
以下のAPIハンドラーをレビューしてください。

観点：
1. セキュリティリスク（深刻度：高/中/低で分類）
2. エラーハンドリングの漏れ
3. パフォーマンス上の問題

形式：
各問題について「問題 → 改善コード → 理由」の順で記載してください。
問題がない観点は「問題なし」と記載してください。
```

#### ケース2：翻訳依頼

```
# Before（悪い）
「英語に翻訳して」

# After（良い）
以下の日本語テキストを英語に翻訳してください。

条件：
- テクニカルブログ向けの自然な英語
- 技術用語は業界標準の英語表記を使用
- 直訳ではなく意味が自然に伝わる表現を優先

翻訳のみ返してください。説明・注釈は不要です。
```

## ハンズオン

プロンプト品質スコアリングツールを実装します。

### ステップ1：自動チェッカー

```python
import re
from dataclasses import dataclass

@dataclass
class PromptQualityReport:
    score: int  # 0-100
    passed: list[str]
    warnings: list[str]
    suggestions: list[str]

def check_prompt_quality(prompt: str) -> PromptQualityReport:
    """プロンプトの品質を自動チェック"""
    score = 100
    warnings = []
    suggestions = []
    passed = []

    # チェック1：長さ（短すぎる）
    if len(prompt.strip()) < 20:
        score -= 30
        warnings.append("プロンプトが短すぎます（20文字未満）")
        suggestions.append("具体的な指示・コンテキストを追加してください")
    else:
        passed.append("適切な長さです")

    # チェック2：出力形式の指定
    format_keywords = ["形式", "format", "json", "markdown", "リスト", "箇条書き", "番号"]
    if not any(kw.lower() in prompt.lower() for kw in format_keywords):
        score -= 15
        warnings.append("出力形式が指定されていません")
        suggestions.append("「JSON形式で」「箇条書きで」などの形式を指定してください")
    else:
        passed.append("出力形式が指定されています")

    # チェック3：否定形のみの制約
    negative_patterns = ["しないで", "使わないで", "書かないで"]
    if any(p in prompt for p in negative_patterns) and \
       not any(p in prompt for p in ["してください", "使ってください"]):
        score -= 10
        warnings.append("否定形のみの制約があります")
        suggestions.append("「〜しないで」を「〜してください」の肯定形に変えてください")

    # チェック4：礼儀・前置き（無駄なトークン）
    politeness_patterns = ["お忙しいところ", "恐れ入りますが", "よろしければ"]
    if any(p in prompt for p in politeness_patterns):
        score -= 5
        warnings.append("不要な礼儀表現でトークンを使っています")
        suggestions.append("礼儀表現は省いてトークンを節約できます")

    return PromptQualityReport(
        score=max(0, score),
        passed=passed,
        warnings=warnings,
        suggestions=suggestions
    )


# テスト
prompts = [
    "コードを改善して",
    """あなたはPythonシニアエンジニアです。
以下のコードをレビューし、問題点を「深刻度・問題・改善案」の形式で箇条書きしてください。""",
    "お忙しいところ恐れ入りますが、このJSONをパースする方法を教えていただけますか",
]

for p in prompts:
    report = check_prompt_quality(p)
    print(f"スコア: {report.score}/100")
    print(f"警告: {report.warnings}")
    print(f"提案: {report.suggestions}\n")
```

### 完成コード

```python
from dataclasses import dataclass, field

@dataclass
class PromptChecker:
    """プロンプト品質チェッカー"""

    CHECKS = [
        {
            "name": "十分な長さ",
            "fn": lambda p: len(p.strip()) >= 30,
            "weight": 20,
            "suggestion": "30文字以上の具体的な指示にしてください"
        },
        {
            "name": "出力形式の指定",
            "fn": lambda p: any(k in p.lower() for k in
                               ["形式", "json", "markdown", "箇条書き", "リスト", "番号"]),
            "weight": 20,
            "suggestion": "「JSON形式で」「箇条書きで」などを追加してください"
        },
        {
            "name": "動詞から始まる指示",
            "fn": lambda p: any(p.strip().startswith(v) for v in
                               ["以下", "次の", "あなた", "与えられた", "提供"]),
            "weight": 15,
            "suggestion": "「以下を...してください」などの明確な動詞指示を使ってください"
        },
        {
            "name": "礼儀表現なし",
            "fn": lambda p: not any(k in p for k in ["お忙しい", "恐れ入り", "よろしければ"]),
            "weight": 10,
            "suggestion": "不要な礼儀表現を省いてトークンを節約してください"
        },
    ]

    def check(self, prompt: str) -> dict:
        score = 0
        max_score = sum(c["weight"] for c in self.CHECKS)
        results = []

        for check in self.CHECKS:
            passed = check["fn"](prompt)
            if passed:
                score += check["weight"]
            results.append({
                "name": check["name"],
                "passed": passed,
                "suggestion": None if passed else check["suggestion"]
            })

        return {
            "score": int(score / max_score * 100),
            "results": results,
            "suggestions": [r["suggestion"] for r in results if not r["passed"]]
        }


if __name__ == "__main__":
    checker = PromptChecker()

    test_prompts = {
        "悪い例": "コードを直して",
        "普通の例": "このPythonコードのバグを見つけてください",
        "良い例": "あなたはPythonシニアエンジニアです。以下のコードのバグを特定し、修正案をコード付きで箇条書きしてください。",
    }

    for label, prompt in test_prompts.items():
        result = checker.check(prompt)
        print(f"{label}: スコア {result['score']}/100")
        for s in result["suggestions"]:
            print(f"  → {s}")
        print()
```

## クイズ

<!-- QUIZ:START -->
**Q1. 「難しい言葉を使わないで」という指示の問題点は何ですか？**

- A) 文字数が少ない
- B) 否定形のみで基準が曖昧なため、モデルが「難しい言葉」の定義を正確に把握できない
- C) 敬語が使われていない
- D) 出力形式が指定されていない

**正解: B**
**解説:** 否定形のみの制約は基準が曖昧です。「高校生でも理解できる平易な言葉で」のように肯定形で具体的な基準を示すと、モデルが意図を正確に把握できます。

**Q2. 1つのプロンプトに複数タスクを混在させる問題として最も適切なものはどれですか？**

- A) APIコストが下がる
- B) 各タスクの品質が低下し、一部のタスクが無視・省略される可能性がある
- C) レスポンスが速くなる
- D) 出力が短くなる

**正解: B**
**解説:** 1つのプロンプトに複数タスクを詰め込むと、モデルが一部を省略したり、各タスクの品質が下がったりします。タスクは1プロンプト1タスクが原則です。

**Q3. コンテキスト不足のプロンプトに追加すべき情報として最も重要でないものはどれですか？**

- A) 対象となるコードの言語・バージョン
- B) 出力の用途・目的
- C) 作成者の個人情報
- D) 使用するフレームワーク・ライブラリ

**正解: C**
**解説:** 作成者の個人情報はAIの出力品質に影響しません。言語・バージョン・用途・フレームワークなどの技術的コンテキストが重要です。
<!-- QUIZ:END -->

## まとめ

- 悪いプロンプトの7パターン：曖昧・形式未指定・コンテキスト不足・無駄な礼儀・否定形のみ・複数タスク・事実確認なし
- プロンプト品質チェックリストで自己評価する習慣をつける
- ビフォーアフターで改善パターンを身体で覚える
- 自動チェッカーで品質を数値化・可視化できる

## 次のレッスン

次のレッスンでは、プロンプトの変更履歴を管理し、チームで共有するための「プロンプトのバージョン管理」を学びます。
