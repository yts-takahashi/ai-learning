import Link from 'next/link';
import { CHAPTERS, TOTAL_LESSONS } from '@/lib/constants';
import HomeProgressBanner from '@/components/features/HomeProgressBanner';

export default function Home() {
  return (
    <div>
      <HomeProgressBanner />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
              生成AIを体系的に
              <br />
              学ぶプラットフォーム
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              プロンプトエンジニアリングからAPI活用・RAG/エージェントまで、
              実践的なハンズオンとクイズを通じて学べる日本語コンテンツ。
              全 {TOTAL_LESSONS} レッスン、10チャプター構成。
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/lessons"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                学習を始める
              </Link>
              <Link
                href="/dashboard"
                className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                進捗を確認する
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-12">3ステップで理解を深める</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📖</span>
              </div>
              <h3 className="font-bold text-lg mb-2">記事で理解</h3>
              <p className="text-gray-600 text-sm">
                テキストと図解でコンセプトをしっかり理解。基礎から応用まで丁寧に解説します。
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💻</span>
              </div>
              <h3 className="font-bold text-lg mb-2">ハンズオンで実践</h3>
              <p className="text-gray-600 text-sm">
                コードを書きながら実際に手を動かして学ぶ。実務に直結するスキルを習得できます。
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="font-bold text-lg mb-2">クイズで確認</h3>
              <p className="text-gray-600 text-sm">
                各レッスン終了後にクイズで理解度チェック。解説付きで知識を定着させます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">カリキュラム</h2>
            <p className="text-gray-600">
              全 {TOTAL_LESSONS} レッスン・10チャプターで生成AIを体系的に学ぶ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CHAPTERS.map((chapter) => (
              <Link
                key={chapter.number}
                href={`/lessons?chapter=${chapter.number}`}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-700 transition-colors">
                    <span className="text-white font-bold text-sm">{chapter.number}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {chapter.title}
                      </h3>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {chapter.lessonCount} レッスン
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">{chapter.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/lessons"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              すべてのレッスンを見る
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
