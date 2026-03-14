import type { MetadataRoute } from 'next';
import { getAllLessons } from '@/lib/lessons';

const BASE_URL = 'https://ai-learning.example.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const lessons = getAllLessons();

  const lessonEntries: MetadataRoute.Sitemap = lessons.map((lesson) => ({
    url: `${BASE_URL}/lessons/${lesson.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/lessons`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...lessonEntries,
  ];
}
