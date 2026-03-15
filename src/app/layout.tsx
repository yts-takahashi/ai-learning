import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import HeaderWrapper from '@/components/layout/HeaderWrapper';
import { websiteSchema } from '@/lib/schema';
import KeyboardShortcutsModalLoader from '@/components/ui/KeyboardShortcutsModalLoader';

export const metadata: Metadata = {
  title: 'AI Learning — 生成AIを体系的に学ぶ',
  description:
    'プロンプトエンジニアリングからAPI活用・RAG/エージェントまで、実践的なハンズオンを通じて学べる日本語学習プラットフォーム',
  openGraph: {
    title: 'AI Learning — 生成AIを体系的に学ぶ',
    description:
      'プロンプトエンジニアリングからAPI活用・RAG/エージェントまで、実践的なハンズオンを通じて学べる日本語学習プラットフォーム',
    type: 'website',
    locale: 'ja_JP',
    siteName: 'AI Learning',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Learning — 生成AIを体系的に学ぶ',
    description:
      'プロンプトエンジニアリングからAPI活用・RAG/エージェントまで、実践的なハンズオンを通じて学べる日本語学習プラットフォーム',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
        />
      </head>
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium focus:shadow-lg"
        >
          メインコンテンツへスキップ
        </a>
        <HeaderWrapper />
        <KeyboardShortcutsModalLoader />
        <main id="main-content">{children}</main>
        <footer className="border-t border-gray-200 bg-white mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-gray-500 text-sm">
                © 2026 YTS Inc.
              </p>
              <nav aria-label="フッターナビゲーション" className="flex items-center gap-6">
                <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  ホーム
                </Link>
                <Link href="/lessons" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  レッスン一覧
                </Link>
                <Link href="/dashboard" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  進捗ダッシュボード
                </Link>
              </nav>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
