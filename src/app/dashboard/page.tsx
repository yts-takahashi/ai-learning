import { getChapters, getAllLessons } from '@/lib/lessons';
import { CHAPTERS } from '@/lib/constants';
import DashboardClient from '@/components/features/DashboardClient';

export const metadata = {
  title: '進捗ダッシュボード — AI Learning',
  description: '生成AI学習の進捗状況を確認できるダッシュボード。チャプター別の完了状況を把握しましょう。',
  openGraph: {
    title: '進捗ダッシュボード — AI Learning',
    description: '生成AI学習の進捗状況を確認できるダッシュボード。チャプター別の完了状況を把握しましょう。',
    type: 'website' as const,
    locale: 'ja_JP',
    siteName: 'AI Learning',
  },
  twitter: {
    card: 'summary' as const,
    title: '進捗ダッシュボード — AI Learning',
    description: '生成AI学習の進捗状況を確認できるダッシュボード。チャプター別の完了状況を把握しましょう。',
  },
};

export default function DashboardPage() {
  const chapters = getChapters();
  const allLessons = getAllLessons();
  const allSlugs = allLessons.map((l) => l.slug);
  const lessonTitleMap = Object.fromEntries(allLessons.map((l) => [l.slug, l.title]));

  const chapterProgressInfos = CHAPTERS.map((chInfo) => {
    const chapter = chapters.find((c) => c.number === chInfo.number);
    const slugs = chapter?.lessons.map((l) => l.slug) ?? [];
    return {
      number: chInfo.number,
      title: chInfo.title,
      slugs,
    };
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">進捗ダッシュボード</h1>
        <p className="text-gray-500">学習の進み具合を確認できます</p>
      </div>

      <DashboardClient chapterProgressInfos={chapterProgressInfos} allSlugs={allSlugs} lessonTitleMap={lessonTitleMap} />
    </div>
  );
}
