import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold text-blue-400">?</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">404 — ページが見つかりません</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          お探しのページは存在しないか、移動した可能性があります。
          URLをご確認のうえ、再度アクセスしてください。
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            ホームへ戻る
          </Link>
          <Link
            href="/lessons"
            className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:border-blue-300 hover:text-blue-600 transition-colors"
          >
            レッスン一覧を見る
          </Link>
        </div>
      </div>
    </div>
  );
}
