# 進捗ダッシュボード 仕様書

## URL
`/dashboard`

## 構成

- **全体進捗バー** — 完了済みレッスン数 / 全121レッスン
- **チャプター別進捗** — 各チャプターのタイトル + 進捗バー（完了数/レッスン数）
- **最近完了したレッスン** — 最大5件のリスト（レッスン詳細ページへのリンク付き）
- **未完了時の空状態** — 学習開始を促すCTAボタン

## コンポーネント
- `src/app/dashboard/page.tsx` — Server Component（データ準備）
- `src/components/features/DashboardClient.tsx` — Client Component（localStorageから進捗取得・表示）
- `src/components/ui/ProgressBar.tsx` — 進捗バー
