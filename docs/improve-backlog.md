# 改善バックログ

<!-- 上から順に実装する。完了したアイテムは削除する。 -->

## 未実装

- [ ] **ProgressBarにaria属性追加** | アクセシビリティ | Impact:High | Effort:Low | role="progressbar"・aria-valuenow・aria-valuemin・aria-valuemaxを追加
- [ ] **LessonContentタブにrole属性追加** | アクセシビリティ | Impact:High | Effort:Low | tablist/tab/tabpanel roleとaria-selectedを付与
- [ ] **キーボードショートカットのヒント表示** | 学習体験 | Impact:Medium | Effort:Low | レッスン詳細ページ下部に「j:次のレッスン / k:前のレッスン」の薄いヒントを表示
- [ ] **レッスン一覧ページにメタデータ追加** | SEO | Impact:Medium | Effort:Low | /lessonsページにgenerateMetadataでタイトル・OG・Twitterカードを設定
- [ ] **ダッシュボードページにOGメタデータ追加** | SEO | Impact:Medium | Effort:Low | dashboardページのmetadataにopenGraph・twitterプロパティを追加
- [ ] **ChapterFilterボタンにaria-pressed追加** | アクセシビリティ | Impact:Medium | Effort:Low | 選択中チャプターフィルターボタンにaria-pressedを追加
- [ ] **クイズ全問正解時に次レッスンへの誘導ボタン表示** | 学習体験 | Impact:Medium | Effort:Medium | クイズで全問正解した際に「次のレッスンへ」ボタンを表示
- [ ] **レッスンカードのページリンク先がすべてレッスン一覧ページ（Header内「学習を始める」）** | コード品質 | Impact:Low | Effort:Low | HeaderとHomeのCTAリンクの整合性確認・修正

## 実装済み（このセッション）

- [x] **ダッシュボードの最近完了レッスンにタイトル表示** | UX | slugではなく人間が読めるタイトルを表示
- [x] **コードブロックにコピーボタンを追加** | UX | ホバー時にコピーボタン表示、2秒後リセット
- [x] **クイズのaria属性追加** | アクセシビリティ | role・aria-labelledby・aria-live等を追加
- [x] **モバイルメニュー（ハンバーガー）** | UX | ヘッダーにハンバーガーボタンを追加しモバイルでサイドナビをドロワー表示
- [x] **skip-to-content リンク** | アクセシビリティ | ページ先頭に「メインコンテンツへスキップ」リンクをキーボードユーザー向けに追加
- [x] **OpenGraph/Twitter Card メタデータ** | SEO | 各ページに og:title・og:description・twitter:card を設定
- [x] **著作権年の更新（2024→2026）** | コード品質 | フッターの著作権年表示を修正
- [x] **キーボードショートカット（j/k）** | 学習体験 | レッスン詳細ページで j/k キーで前後レッスンに移動
- [x] **チャプター内残りレッスン数表示** | 学習体験 | レッスン一覧・詳細ページにチャプター内の残りレッスン数を表示
