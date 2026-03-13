---
title: "定量指標の活用"
chapter: 8
chapterTitle: "プロンプトの評価・テスト"
lessonNumber: 5
slug: "quantitative-metrics"
duration: 20
difficulty: "intermediate"
hasHandsOn: true
hasQuiz: true
---

## 概要

BLEU・ROUGE・Exact Matchなどの定量的評価指標は、LLM評価の基礎となります。各指標の計算方法・特性・適した用途を理解し、用途に応じて正しく選択できるようになります。

## 本文

### 主要な定量指標の比較

| 指標 | 計算対象 | 適した用途 | 限界 |
|------|---------|-----------|------|
| Exact Match | 完全一致 | 分類・短い回答 | 言い換えを評価できない |
| BLEU | N-gram精度 | 翻訳・要約 | 意味の近さを反映しにくい |
| ROUGE | N-gram再現率 | 要約 | 流暢さを評価できない |
| F1 | 精度と再現率の調和平均 | 情報抽出・分類 | 閾値の設定が必要 |
| BERTScore | 埋め込み類似度 | 意味の近さ | 計算コストが高い |

### Exact Match

```python
def exact_match(prediction: str, reference: str, normalize: bool = True) -> float:
    """完全一致評価"""
    if normalize:
        # 正規化（大文字小文字・空白を統一）
        pred = prediction.strip().lower()
        ref = reference.strip().lower()
    else:
        pred, ref = prediction, reference

    return 1.0 if pred == ref else 0.0

# 使用例
print(exact_match("東京", "東京"))       # 1.0
print(exact_match("東京都", "東京"))     # 0.0
print(exact_match("TOKYO", "tokyo", normalize=True))  # 1.0
```

### BLEU（Bilingual Evaluation Understudy）

```python
from collections import Counter
import math

def compute_ngrams(text: str, n: int) -> Counter:
    """N-gramを計算する"""
    tokens = text.split()
    ngrams = [tuple(tokens[i:i+n]) for i in range(len(tokens) - n + 1)]
    return Counter(ngrams)

def bleu_score(hypothesis: str, reference: str, max_n: int = 4) -> float:
    """簡易BLEU スコアの計算"""
    hyp_tokens = hypothesis.split()
    ref_tokens = reference.split()

    if len(hyp_tokens) == 0:
        return 0.0

    # Brevity Penalty（短すぎるペナルティ）
    bp = min(1.0, math.exp(1 - len(ref_tokens) / len(hyp_tokens)))

    # 各N-gramの精度を計算
    precisions = []
    for n in range(1, min(max_n, len(hyp_tokens)) + 1):
        hyp_ngrams = compute_ngrams(hypothesis, n)
        ref_ngrams = compute_ngrams(reference, n)

        # クリップ付き精度
        clipped = sum(min(count, ref_ngrams[gram]) for gram, count in hyp_ngrams.items())
        total = sum(hyp_ngrams.values())

        if total > 0:
            precisions.append(clipped / total)
        else:
            precisions.append(0.0)

    if not precisions or any(p == 0 for p in precisions):
        return 0.0

    # 幾何平均
    log_avg = sum(math.log(p) for p in precisions) / len(precisions)
    return bp * math.exp(log_avg)

# 使用例
hyp = "機械学習はデータからパターンを学習するアルゴリズムです"
ref = "機械学習とはデータから自動的に学習するアルゴリズムの総称です"
print(f"BLEU: {bleu_score(hyp, ref):.3f}")
```

### ROUGE（Recall-Oriented Understudy for Gisting Evaluation）

```python
def rouge_n(hypothesis: str, reference: str, n: int = 1) -> dict:
    """ROUGE-N スコアの計算"""
    hyp_ngrams = compute_ngrams(hypothesis, n)
    ref_ngrams = compute_ngrams(reference, n)

    # 共通のN-gram数
    overlap = sum(min(count, hyp_ngrams[gram]) for gram, count in ref_ngrams.items())

    # 再現率（Recall）: 参照文のN-gramをどれだけカバーしているか
    recall = overlap / max(sum(ref_ngrams.values()), 1)

    # 精度（Precision）: 生成文のN-gramのうち参照文に含まれる割合
    precision = overlap / max(sum(hyp_ngrams.values()), 1)

    # F1スコア
    if precision + recall > 0:
        f1 = 2 * precision * recall / (precision + recall)
    else:
        f1 = 0.0

    return {"precision": precision, "recall": recall, "f1": f1}


def rouge_l(hypothesis: str, reference: str) -> dict:
    """ROUGE-L（最長共通部分列）スコアの計算"""
    hyp_tokens = hypothesis.split()
    ref_tokens = reference.split()

    # LCS（最長共通部分列）の長さを動的計画法で計算
    m, n = len(hyp_tokens), len(ref_tokens)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if hyp_tokens[i-1] == ref_tokens[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])

    lcs_len = dp[m][n]
    recall = lcs_len / max(n, 1)
    precision = lcs_len / max(m, 1)
    f1 = 2 * precision * recall / (precision + recall) if precision + recall > 0 else 0.0

    return {"precision": precision, "recall": recall, "f1": f1}


# 使用例
summary = "機械学習はデータから学習するアルゴリズムです"
reference_summary = "機械学習はデータからパターンを自動学習する技術です"

rouge1 = rouge_n(summary, reference_summary, n=1)
rouge2 = rouge_n(summary, reference_summary, n=2)
rougel = rouge_l(summary, reference_summary)

print(f"ROUGE-1 F1: {rouge1['f1']:.3f}")
print(f"ROUGE-2 F1: {rouge2['f1']:.3f}")
print(f"ROUGE-L F1: {rougel['f1']:.3f}")
```

### 実用的な指標の組み合わせ

```python
def evaluate_response(
    prediction: str,
    reference: str,
    task_type: str = "qa"
) -> dict:
    """タスクタイプに応じた指標を計算"""

    if task_type == "classification":
        return {"exact_match": exact_match(prediction, reference)}

    elif task_type == "summarization":
        return {
            "rouge1": rouge_n(prediction, reference, n=1)["f1"],
            "rouge2": rouge_n(prediction, reference, n=2)["f1"],
            "rougeL": rouge_l(prediction, reference)["f1"],
        }

    elif task_type == "translation":
        return {"bleu": bleu_score(prediction, reference)}

    else:  # general qa
        return {
            "exact_match": exact_match(prediction, reference),
            "rouge1": rouge_n(prediction, reference, n=1)["f1"],
            "rouge2": rouge_n(prediction, reference, n=2)["f1"],
        }
```

## ハンズオン

評価指標を使った比較分析を実装してみましょう。

### ステップ1：複数プロンプトの比較評価

```python
def compare_prompts_with_metrics(
    test_cases: list[dict],
    prompt_versions: dict[str, str]
) -> dict:
    """複数のプロンプトを定量指標で比較"""
    import anthropic
    client = anthropic.Anthropic()

    results = {}

    for version_name, prompt_template in prompt_versions.items():
        version_scores = {"exact_match": [], "rouge1": [], "rouge2": []}

        for tc in test_cases:
            # 回答生成
            response = client.messages.create(
                model="claude-opus-4-5",
                max_tokens=500,
                messages=[{
                    "role": "user",
                    "content": prompt_template.format(question=tc["question"])
                }]
            )
            prediction = response.content[0].text
            reference = tc["reference"]

            # 指標計算
            version_scores["exact_match"].append(exact_match(prediction, reference))
            version_scores["rouge1"].append(rouge_n(prediction, reference, 1)["f1"])
            version_scores["rouge2"].append(rouge_n(prediction, reference, 2)["f1"])

        # 平均を計算
        results[version_name] = {
            metric: sum(scores) / len(scores)
            for metric, scores in version_scores.items()
        }

    return results

# テストデータ（モック）
mock_test_cases = [
    {"question": "Pythonの作者は誰ですか？",
     "reference": "グイド・ヴァン・ロッサムです"},
    {"question": "機械学習の主な種類を教えてください",
     "reference": "教師あり学習、教師なし学習、強化学習の3種類があります"},
]

mock_prompts = {
    "v1": "{question}",
    "v2": "以下の質問に簡潔に答えてください：{question}",
}

print("プロンプトバージョン比較（指標ベース）:")
print("テストデータ: モック（実際のAPI呼び出しは省略）")
for version, prompt in mock_prompts.items():
    print(f"\n{version}: {prompt[:40]}...")
```

## クイズ

<!-- QUIZ:START -->
**Q1. ROUGE スコアが BLEU より要約評価に向いている理由はどれですか？**

- A) ROUGE の方が計算が速いため
- B) ROUGEは再現率（recall）を重視し、参照文の情報をどれだけカバーしているかを測るため
- C) ROUGE は日本語に最適化されているため
- D) ROUGE は文法を評価するため

**正解: B**
**解説:** 要約評価では「参照文の重要情報をどれだけ含んでいるか（再現率）」が重要です。ROUGEは再現率ベースの指標なので要約評価に適しています。BLEUは精度ベースで翻訳評価に適しています。

**Q2. Exact Matchが適さない評価タスクはどれですか？**

- A) 感情分類（ポジティブ/ネガティブ）
- B) 数値計算問題（「2+2=?」）
- C) 自由記述の質問回答（「AIとは何か説明してください」）
- D) はい/いいえの質問

**正解: C**
**解説:** Exact Matchは生成文が参照文と完全に一致する場合のみ1.0を返します。自由記述では同じ意味でも異なる表現がいくつもあるため（「AIとは人工知能です」「AIは人工的に作られた知能です」）、Exact Matchでは評価できません。

**Q3. BLEUスコアが0になる主な原因はどれですか？**

- A) 文字数が多すぎる場合
- B) 生成文のN-gramが参照文に全く含まれない場合（特に4-gramが0の場合）
- C) 生成文が英語の場合
- D) 参照文が複数ある場合

**正解: B**
**解説:** BLEUは複数のN-gram精度の幾何平均を計算します。1-gram・2-gram・3-gram・4-gramの精度のうち1つでも0になると全体のBLEUが0になります（対数の計算で-∞になるため）。特に4-gramは長いフレーズの一致を要求するので0になりやすいです。
<!-- QUIZ:END -->

## まとめ

- Exact Matchは分類・短い回答向け、BLEUは翻訳向け、ROUGEは要約向けの定量指標
- 定量指標は自動計算できるが意味的な正確さを完全には評価できない
- タスクタイプに応じて適切な指標を選択し、複数指標を組み合わせて評価する
- 定量指標はLLM-as-a-Judgeや人手評価と組み合わせることで実用的な評価システムになる

## 次のレッスン

次のレッスンでは、OpenAI EvalsやカスタムEvalsフレームワークの構築方法を学びます。
