# レッスン一覧ページ 仕様書

## URL
`/lessons`
`/lessons?chapter=1` — チャプターフィルター付き

## 構成

- **進捗バー** — `LessonsProgress`（Client Component）でlocalStorageから進捗を読み取り表示
- **チャプターフィルター** — `ChapterFilter`（Client Component）でURLクエリを更新
- **チャプター一覧** — Server Componentで`getChapters()`を呼び、チャプターごとにグループ化
- **レッスンカード** — `LessonCard`（Client Component）、完了状態をlocalStorageから取得

## コンポーネント
- `src/app/lessons/page.tsx` — Server Component（メインページ）
- `src/components/features/LessonsProgress.tsx` — 進捗バー表示
- `src/components/features/ChapterFilter.tsx` — フィルターボタン
- `src/components/features/LessonCard.tsx` — 各レッスンのカード
