# 改善バックログ

<!-- 上から順に実装する。完了したアイテムは削除する。 -->

## 未実装

- [ ] **コンテンツ検索機能（Fuse.js）** | UX/UI | Impact:Medium | Effort:Medium | Headerに検索ボックスを追加、Fuse.jsでレッスンタイトル・説明の全文検索を実装

## 実装済み（このセッション）

- [x] **構造化データ（Schema.org）実装** | SEO | WebSite・LearningResource・BreadcrumbList のLD+JSONを各ページに追加
- [x] **レッスン内関連リンク（RelatedLesson）コンポーネント** | 学習体験 | MDXで`<RelatedLesson slug="..."/>`を使えるコンポーネントを追加
- [x] **サイトマップ（sitemap.xml）自動生成** | SEO | App Router組み込みsitemap.tsで全レッスンURLを含むサイトマップ生成
- [x] **クイズ選択肢のランダム化** | 学習体験 | Quiz.tsxでoptionsをシャッフルして再学習時に学習効果を向上
- [x] **Dynamic Import でMermaid遅延読み込み** | パフォーマンス | MermaidChartをnext/dynamicでラップしssr:false、初期バンドルを削減
- [x] **モバイルスワイプでレッスン切り替え** | UX/UI | useSwipeフックを作成し、タッチジェスチャーで前後レッスン切り替えを実装
- [x] **型安全性強化（Zod スキーマ導入）** | コード品質 | frontmatterパース時にZodでバリデーション、不正データの早期検知

- [x] **レッスンカードのリンク整合性確認** | コード品質 | Header・HomeのCTAリンクはすべて/lessonsで整合済み
- [x] **クイズ全問正解時に次レッスンへの誘導ボタン表示** | 学習体験 | nextSlugがLessonContentに渡されていなかったバグを修正
- [x] **キーボードショートカットのヒント表示** | 学習体験 | レッスンページ下部にj/kキーヒントを追加
- [x] **LessonContentタブにrole属性追加** | アクセシビリティ | すでに実装済みと確認
- [x] **ProgressBarにaria属性追加** | アクセシビリティ | すでに実装済みと確認
- [x] **レッスン一覧ページにメタデータ追加** | SEO | /lessonsページにOG・Twitterカードを設定
- [x] **ダッシュボードページにOGメタデータ追加** | SEO | dashboardページのOG・twitterプロパティを追加
- [x] **ChapterFilterボタンにaria-pressed追加** | アクセシビリティ | 選択中フィルターボタンにaria-pressed・role=groupを追加
- [x] **ダッシュボードの最近完了レッスンにタイトル表示** | UX | slugではなく人間が読めるタイトルを表示
- [x] **コードブロックにコピーボタンを追加** | UX | ホバー時にコピーボタン表示、2秒後リセット
- [x] **クイズのaria属性追加** | アクセシビリティ | role・aria-labelledby・aria-live等を追加
- [x] **モバイルメニュー（ハンバーガー）** | UX | ヘッダーにハンバーガーボタンを追加しモバイルでサイドナビをドロワー表示
- [x] **skip-to-content リンク** | アクセシビリティ | ページ先頭に「メインコンテンツへスキップ」リンクをキーボードユーザー向けに追加
- [x] **OpenGraph/Twitter Card メタデータ** | SEO | 各ページに og:title・og:description・twitter:card を設定
- [x] **著作権年の更新（2024→2026）** | コード品質 | フッターの著作権年表示を修正
- [x] **キーボードショートカット（j/k）** | 学習体験 | レッスン詳細ページで j/k キーで前後レッスンに移動
- [x] **チャプター内残りレッスン数表示** | 学習体験 | レッスン一覧・詳細ページにチャプター内の残りレッスン数を表示
