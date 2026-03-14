import { getAllLessons } from '@/lib/lessons';
import { buildSearchIndex } from '@/lib/search';
import Header from './Header';

export default function HeaderWrapper() {
  const lessons = getAllLessons();
  const searchItems = buildSearchIndex(lessons);
  return <Header searchItems={searchItems} />;
}
