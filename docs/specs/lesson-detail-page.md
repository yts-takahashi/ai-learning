# レッスン詳細ページ 仕様書

## URL
`/lessons/[slug]`

## 構成

- **パンくずナビ** — ホーム / レッスン一覧 / チャプター / レッスン名
- **レッスンヘッダー** — チャプター名・難易度バッジ・タイトル・所要時間・ハンズオン/クイズ有無
- **タブ切り替え** — 記事 / ハンズオン / クイズ（hasHandsOn・hasQuizフラグで制御）
- **完了ボタン** — `LessonComplete`（Client Component）
- **前後ナビ** — 前のレッスン・次のレッスンへのリンク

## コンテンツ分割ルール

- 記事: フロントマター以降で`## ハンズオン`セクション手前まで
- ハンズオン: `## ハンズオン`以降
- クイズ: `<!-- QUIZ:START -->` ～ `<!-- QUIZ:END -->`ブロック（記事本文から除外）

## コンポーネント
- `src/app/lessons/[slug]/page.tsx` — Server Component
- `src/lib/parseLesson.ts` — コンテンツ分割ロジック
- `src/lib/parseQuiz.ts` — クイズMarkdownのパース
- `src/components/features/LessonContent.tsx` — タブ切り替え（Client Component）
- `src/components/features/Quiz.tsx` — インタラクティブクイズ（Client Component）
- `src/components/features/LessonComplete.tsx` — 完了ボタン（Client Component）
