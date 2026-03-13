export interface ChapterInfo {
  number: number;
  title: string;
  description: string;
  lessonCount: number;
  slug: string;
}

export const CHAPTERS: ChapterInfo[] = [
  {
    number: 1,
    title: 'プロンプトエンジニアリング',
    description: 'プロンプトの基礎から高度なテクニックまで、AIに最適な指示を出す方法を学ぶ',
    lessonCount: 12,
    slug: 'chapter-01',
  },
  {
    number: 2,
    title: 'API活用',
    description: 'Claude・OpenAI などの主要 API の使い方とベストプラクティスを学ぶ',
    lessonCount: 11,
    slug: 'chapter-02',
  },
  {
    number: 3,
    title: 'RAG・エージェント',
    description: '検索拡張生成とAIエージェントの設計・実装パターンを学ぶ',
    lessonCount: 13,
    slug: 'chapter-03',
  },
  {
    number: 4,
    title: 'ビジネス活用事例',
    description: '実際のビジネスシーンでの生成AI活用事例とROI測定を学ぶ',
    lessonCount: 10,
    slug: 'chapter-04',
  },
  {
    number: 5,
    title: 'ファインチューニング',
    description: '事前学習済みモデルを独自データで追加学習する方法を学ぶ',
    lessonCount: 11,
    slug: 'chapter-05',
  },
  {
    number: 6,
    title: 'セキュリティ・レッドチーム',
    description: '生成AIのセキュリティリスクと対策・レッドチームの進め方を学ぶ',
    lessonCount: 11,
    slug: 'chapter-06',
  },
  {
    number: 7,
    title: 'MCP・ツール連携',
    description: 'Model Context Protocol でAIに外部ツールを接続する方法を学ぶ',
    lessonCount: 10,
    slug: 'chapter-07',
  },
  {
    number: 8,
    title: 'プロンプトの評価・テスト',
    description: 'LLMの出力品質を測定・改善するための評価フレームワークを学ぶ',
    lessonCount: 11,
    slug: 'chapter-08',
  },
  {
    number: 9,
    title: 'AI開発のアーキテクチャ設計',
    description: 'スケーラブルなAIアプリケーションのアーキテクチャパターンを学ぶ',
    lessonCount: 11,
    slug: 'chapter-09',
  },
  {
    number: 10,
    title: 'ハーネスエンジニアリング・自律開発',
    description: 'AIの力を最大限に引き出す環境設計とAgentic Codingを学ぶ',
    lessonCount: 12,
    slug: 'chapter-10',
  },
];

export const TOTAL_LESSONS = CHAPTERS.reduce((sum, ch) => sum + ch.lessonCount, 0);

export const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '上級',
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};
