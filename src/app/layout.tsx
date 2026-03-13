import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'AI Learning — 生成AIを体系的に学ぶ',
  description:
    'プロンプトエンジニアリングからAPI活用・RAG/エージェントまで、実践的なハンズオンを通じて学べる日本語学習プラットフォーム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <Header />
        <main>{children}</main>
        <footer className="border-t border-gray-200 bg-white mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-center text-gray-500 text-sm">
              © 2024 AI Learning. 生成AIを体系的に学ぶプラットフォーム
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
