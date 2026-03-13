---
name: content
description: eラーニングの教材コンテンツ（レッスンMarkdown）を作成するスキル。「教材を作って」「レッスンを書いて」「コンテンツを作成して」など、学習コンテンツの作成依頼があれば使う。アプリ実装とは独立して並列で実行できる。
---

## 役割

`docs/PRD.md` のカリキュラムに従い、全121レッスンのMarkdownファイルを
`content/lessons/` に作成する。

## ファイル構成

```
content/lessons/
  chapter-01/
    01-what-is-prompt.md
    02-basic-structure.md
    ...
  chapter-02/
    01-api-basics.md
    ...
```

## ファイル命名規則

`{レッスン番号}-{タイトルのkebab-case}.md`

例: `01-what-is-prompt.md`

## Markdownフロントマター

各ファイルの先頭に必ず記述する：

```markdown
---
title: "プロンプトとは何か"
chapter: 1
chapterTitle: "プロンプトエンジニアリング"
lessonNumber: 1
slug: "what-is-prompt"
duration: 15
difficulty: "beginner"
hasHandsOn: true
hasQuiz: true
---
```

### difficulty の値
- `beginner` — 概念・入門
- `intermediate` — 実装・応用
- `advanced` — 設計・最適化

### duration の目安（分）
- 記事のみ: 10〜15分
- 記事 + ハンズオン: 20〜30分
- 記事 + ハンズオン + クイズ: 30〜40分

## レッスン本文の構成

```markdown
## 概要

<このレッスンで学ぶことを2〜3文で説明>

## 本文

<テキスト + 図解（Mermaid記法を活用）>
<具体例・コード例を豊富に使う>
<エンジニアが実務で使えるレベルの内容>

## ハンズオン

<実際に手を動かすコード演習>
<ステップバイステップで説明>
<完成コードも提示する>

## クイズ

<!-- QUIZ:START -->
**Q1. <問題文>**

- A) <選択肢>
- B) <選択肢>
- C) <選択肢>
- D) <選択肢>

**正解: B**
**解説:** <なぜBが正解かの説明>

**Q2. ...**
<!-- QUIZ:END -->

## まとめ

- <箇条書きで要点を3〜5つ>

## 次のレッスン

<次のレッスンへの橋渡し文>
```

## 手順

### 1. PRDの確認
`docs/PRD.md` を読んで全チャプター・レッスン一覧を把握する。

### 2. 進捗確認
`content/lessons/` を確認して既存ファイルをスキップする。

### 3. レッスン作成
チャプター1から順番に作成する。
各レッスンは以下の品質基準を満たす：
- エンジニアが実務で使える具体的な内容
- コード例は動作するものを使う
- 図解が必要な箇所はMermaid記法を使う
- クイズは3〜5問、正解と解説を必ず付ける

### 4. 進捗更新
チャプターごとに完了したら `docs/PRD.md` の該当タスクを `[x]` に更新する。
