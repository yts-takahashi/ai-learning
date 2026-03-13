import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">AI Learning</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/lessons"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              レッスン一覧
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              ダッシュボード
            </Link>
            <Link
              href="/lessons"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              学習を始める
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
