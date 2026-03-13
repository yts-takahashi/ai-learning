# コンテンツ管理基盤 仕様書

## 概要

Markdownファイルをレッスンとして管理するための基盤。

## ディレクトリ構成

```
content/lessons/
  chapter-01/
    01-what-is-prompt.md
    02-basic-structure.md
    ...
  chapter-02/
    ...
```

## フロントマター形式

```yaml
---
title: プロンプトとは何か
chapter: 1
chapterTitle: プロンプトエンジニアリング
lessonNumber: 1
slug: prompt-engineering-01
duration: 15
difficulty: beginner
hasHandsOn: true
hasQuiz: true
---
```

## 関数一覧

- `getAllLessons()` — 全レッスンを返す
- `getLessonBySlug(slug)` — slugからレッスンを返す
- `getLessonsByChapter(chapterNum)` — チャプター番号からレッスン一覧
- `getChapters()` — チャプター一覧（lessonsを含む）
- `getAdjacentLessons(slug)` — 前後のレッスンを返す
