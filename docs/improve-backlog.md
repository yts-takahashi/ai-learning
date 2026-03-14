# 改善バックログ

<!-- 上から順に実装する。完了したアイテムは削除する。 -->

## 未実装




## 実装済み（このセッション）

- [x] **LessonCardの装飾SVGにaria-hidden追加** | アクセシビリティ | 完了チェック・矢印SVGをスクリーンリーダーから隠す
- [x] **「最近完了したレッスン」見出しに件数表示** | UX/UI | 「直近N件」の補足を追加
- [x] **ホームのカリキュラムsectionにaria-label追加** | アクセシビリティ | ランドマーク構造の改善
- [x] **WeeklyGoal達成時のbg-green-50とplaceholder追加** | UX/UI | 達成状態の視覚強化・入力フィールドのUX改善
- [x] **ダッシュボード全体進捗タイトルをtext-xlに変更** | UX/UI | 情報階層の視覚的強化
- [x] **QuizHistoryDetailのスケルトン追加と件数制限** | UX/UI | スケルトンローディング・6件制限・「もっと見る」ボタンを追加
- [x] **Headerのロゴにaria-label追加** | アクセシビリティ | ロゴリンクのa11y改善
- [x] **レッスン一覧のフィルター後に件数を表示** | UX/UI | 絞り込み結果をaria-live付きで表示
- [x] **LessonContentのタブにaria-disabledを追加** | アクセシビリティ | 無効タブのa11y改善
- [x] **QuizStatsのスケルトンローディング** | UX/UI | ロード中スケルトン表示を追加
- [x] **ProgressBarのaria-valuemax=0エッジケース修正** | アクセシビリティ | max=0時は1に設定
- [x] **LearningInsightsのprogressbar aria属性追加とスケルトン** | アクセシビリティ+UX | role="progressbar"とanimate-pulseスケルトンを追加
- [x] **全レッスン完走時のダッシュボードバナー** | 学習体験 | 完走お祝いバナーをDashboardClientに表示
- [x] **HomeProgressBannerの全完了時お祝いバナー** | 学習体験 | 全完走時に緑のお祝いバナーを表示
- [x] **ChapterProgressの「残りn/m」表記** | UX/UI | 残りレッスン数を分数形式で表示
- [x] **StreakBadgeのスケルトンローディング** | UX/UI | ロード中スケルトンを表示、文言をポジティブ表現に変更
- [x] **Quizのnextが無い時に「レッスン一覧へ」ボタン表示** | 学習体験 | nextSlugがない場合の代替ナビゲーションを追加
- [x] **LessonCardのquiz正答率を色でフィードバック** | UX/UI | 正答率0-39%赤・40-69%黄・70-99%緑・100%金で色分け
- [x] **ホームページ Hero section に aria-label を追加** | アクセシビリティ | sectionにaria-labelを付与
- [x] **SearchModalにaria-live追加** | アクセシビリティ | 検索結果件数変化をスクリーンリーダーに通知
- [x] **BASE_URLを環境変数で管理** | SEO | schema.ts等のハードコードURLをNEXT_PUBLIC_BASE_URL環境変数に統一
- [x] **Structured Dataにdateとauthorを追加** | SEO | lessonSchema()にdatePublished・dateModified・authorを追加
- [x] **フォーカスビジュアルの強化** | アクセシビリティ | globals.cssにfocus-visibleスタイルをグローバルに追加
- [x] **レッスン完了時のアニメーション** | 学習体験 | LessonCompleteのボタン押下時にscaleアニメーションと励ましメッセージを表示
- [x] **canonical URLの設定（レッスンページ）** | SEO | generateMetadataにalternates.canonicalを追加
- [x] **WeeklyGoalに今週学習したレッスン名を表示** | 学習体験 | 今週セッションがあるレッスン名をWeeklyGoalカードに一覧表示
- [x] **本日の学習時間をダッシュボードに表示** | 学習体験 | LearningTimeStatsに今日の学習時間セクションを追加
- [x] **「c」キーでレッスン完了マーク** | 学習体験 | LessonKeyboardNavにuseProgress追加、ショートカット一覧にも追加
- [x] **全クイズ高正答率達成の称賛メッセージ** | 学習体験 | WeakLessonsに全レッスン70%以上達成時の称賛カードを追加
- [x] **目次のアクティブ見出しハイライト** | UX/UI | TableOfContentsをClient Componentに変更しIntersectionObserverを追加
- [x] **クイズ履歴に最終挑戦日時を追加** | 学習体験 | QuizHistoryDetailに相対日付を表示
- [x] **最近完了レッスンを5件→10件に拡大** | UX/UI | recentCompletedのslice(-10)に変更
- [x] **ヘッダーのアクティブリンクハイライト** | UX/UI | usePathnameでカレントページのナビリンクをハイライト
- [x] **prefers-reduced-motion サポート** | アクセシビリティ | globals.cssにメディアクエリを追加
- [x] **全体進捗に応じた励ましメッセージ** | 学習体験 | ダッシュボードの全体進捗カードに完了率別メッセージを追加
- [x] **週次学習目標と達成状況** | 学習体験 | WeeklyGoalコンポーネントを作成しダッシュボードに追加
- [x] **レッスン一覧のチャプター折りたたみ** | UX/UI | Server Component化が必要なためスキップ
- [x] **robots.txtの追加** | SEO | app/robots.tsを作成しクローラー設定とsitemapを追加
- [x] **フッターにナビゲーションリンク追加** | UX/UI | フッターにホーム・レッスン一覧・ダッシュボードへのリンクを追加
- [x] **ダッシュボードに学習カレンダー（30日ヒートマップ）** | 学習体験 | LearningCalendarコンポーネントを作成しダッシュボードに追加
- [x] **クイズ完了後に常に「次のレッスンへ」ボタン表示** | 学習体験 | スコアに関わらずnextSlugがあれば次のレッスンへボタンを表示
- [x] **弱点分析・復習推薦（クイズ低正答率レッスン）** | 学習体験 | WeakLessonsコンポーネントを作成しダッシュボードに追加
- [x] **ホームページに進捗サマリーバナー** | UX/UI | HomeProgressBannerコンポーネントをホームページに追加
- [x] **印刷スタイル** | UX/UI | globals.cssに@media printを追加
- [x] **スキップリンク（Skip to main content）** | アクセシビリティ | layout.tsxに既実装済み
- [x] **ホームページのWebSiteスキーマ** | SEO | layout.tsxのwebsiteSchema()で既実装済み
- [x] **チャプター推定総学習時間の表示** | UX/UI | レッスン一覧チャプターヘッダーに推定時間を表示
- [x] **レッスンカードにクイズ正答率バッジ** | UX/UI | 挑戦済みのレッスンカードに最高正答率を表示（100%時は★マーク）
- [x] **ストリーク節目メッセージ** | 学習体験 | 3/7/30日の節目でStreakBadgeに達成メッセージを追加
- [x] **チャプター完了バッジ** | 学習体験 | チャプター内全レッスン完了時に達成バッジを表示
- [x] **クイズ再挑戦ボタン** | 学習体験 | スコア表示後に「もう一度挑戦する」ボタンで再挑戦可能
- [x] **レッスン一覧の「続きから」ハイライト** | UX/UI | 最初の未完了レッスンに「続きから」バッジを表示
- [x] **学習ペース分析（LearningInsights）** | 学習体験 | チャプター別の完了率・学習時間・クイズ正答率をダッシュボードに表示
- [x] **クイズ不正解後の関連リソース** | 学習体験 | 不正解時に「記事タブで内容を見直す」ボタンを表示しタブを切り替え
- [x] **難易度フィルター** | UX/UI | レッスン一覧に初級/中級/上級フィルターを追加
- [x] **キーボードショートカット一覧モーダル** | UX/UI | ?キーで全ショートカットを一覧表示するモーダルを追加
- [x] **推奨学習時間 vs 実績比較** | 学習体験 | レッスン完了エリアに推奨時間と実績時間を並べて表示
- [x] **連続学習日数トラッカー** | 学習体験 | ストリーク数・最高記録・今日の学習状況をダッシュボードに表示
- [x] **学習時間追跡** | 学習体験 | レッスン滞在時間をlocalStorageに記録しダッシュボードに累計学習時間・セッション数・平均時間を表示
- [x] **クイズ履歴の詳細表示** | 学習体験 | レッスン別の最高正答率・挑戦回数をプログレスバー付きで一覧表示
- [x] **チャプター間の関連性マップ** | UX/UI | /lessonsページにMermaidで章間の依存関係を有向グラフで可視化
- [x] **次に学ぶレッスン推奨** | 学習体験 | ダッシュボード上部に最初の未完了レッスンをブルーカードで表示
- [x] **SearchModal dynamic import最適化** | パフォーマンス | SearchModalをnext/dynamicでラップし初期バンドルから分離
- [x] **レッスン内目次（Table of Contents）** | UX/UI | MDX記事の見出し(h2/h3)から目次を自動生成し記事上部に表示
- [x] **クイズ正答率統計** | 学習体験 | localStorageにクイズ履歴を蓄積しダッシュボードで平均正答率・挑戦回数を表示
- [x] **コンテンツ検索機能（Fuse.js）** | UX/UI | Headerに⌘K検索ボタン追加、Fuse.jsでタイトル・チャプター名を横断検索するモーダルUIを実装
- [x] **構造化データ（Schema.org）実装** | SEO | WebSite・LearningResource・BreadcrumbList のLD+JSONを各ページに追加
- [x] **レッスン内関連リンク（RelatedLesson）コンポーネント** | 学習体験 | MDXで`<RelatedLesson slug="..."/>`を使えるコンポーネントを追加
- [x] **サイトマップ（sitemap.xml）自動生成** | SEO | App Router組み込みsitemap.tsで全レッスンURLを含むサイトマップ生成
- [x] **クイズ選択肢のランダム化** | 学習体験 | Quiz.tsxでoptionsをシャッフルして再学習時に学習効果を向上
- [x] **Dynamic Import でMermaid遅延読み込み** | パフォーマンス | MermaidChartをnext/dynamicでラップしssr:false、初期バンドルを削減
- [x] **モバイルスワイプでレッスン切り替え** | UX/UI | useSwipeフックを作成し、タッチジェスチャーで前後レッスン切り替えを実装
- [x] **型安全性強化（Zod スキーマ導入）** | コード品質 | frontmatterパース時にZodでバリデーション、不正データの早期検知
