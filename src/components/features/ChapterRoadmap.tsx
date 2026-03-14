import dynamic from 'next/dynamic';

const MermaidChart = dynamic(() => import('@/components/features/MermaidChart'), { ssr: false });

const ROADMAP_CHART = `flowchart LR
  Ch1["Ch.1\\nプロンプト\\nエンジニアリング"]
  Ch2["Ch.2\\nAPI活用"]
  Ch3["Ch.3\\nRAG・エージェント"]
  Ch4["Ch.4\\nビジネス活用"]
  Ch5["Ch.5\\nファイン\\nチューニング"]
  Ch6["Ch.6\\nセキュリティ"]
  Ch7["Ch.7\\nMCP・ツール連携"]
  Ch8["Ch.8\\n評価・テスト"]
  Ch9["Ch.9\\nアーキテクチャ"]
  Ch10["Ch.10\\n自律開発"]

  Ch1 --> Ch2
  Ch1 --> Ch6
  Ch1 --> Ch8
  Ch2 --> Ch3
  Ch2 --> Ch5
  Ch2 --> Ch7
  Ch3 --> Ch9
  Ch3 --> Ch10
  Ch4 --> Ch9
  Ch8 --> Ch9

  style Ch1 fill:#dbeafe,stroke:#3b82f6
  style Ch2 fill:#dbeafe,stroke:#3b82f6
  style Ch3 fill:#dcfce7,stroke:#22c55e
  style Ch4 fill:#fef9c3,stroke:#eab308
  style Ch5 fill:#f3e8ff,stroke:#a855f7
  style Ch6 fill:#fee2e2,stroke:#ef4444
  style Ch7 fill:#dcfce7,stroke:#22c55e
  style Ch8 fill:#fef9c3,stroke:#eab308
  style Ch9 fill:#f3e8ff,stroke:#a855f7
  style Ch10 fill:#fee2e2,stroke:#ef4444`;

export default function ChapterRoadmap() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
      <h2 className="font-bold text-lg text-gray-900 mb-1">学習ロードマップ</h2>
      <p className="text-sm text-gray-500 mb-4">チャプター間の依存関係と推奨学習順序</p>
      <div className="overflow-x-auto">
        <MermaidChart chart={ROADMAP_CHART} />
      </div>
    </div>
  );
}
