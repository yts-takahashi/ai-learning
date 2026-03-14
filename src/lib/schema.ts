import type { Lesson } from './types';
import { BASE_URL } from './constants';

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AI Learning',
    description:
      'プロンプトエンジニアリングからAPI活用・RAG/エージェントまで、実践的なハンズオンを通じて学べる日本語学習プラットフォーム',
    url: BASE_URL,
    inLanguage: 'ja',
  };
}

export function educationalCourseSchema(lessons: Lesson[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'AI Learning — 生成AIを体系的に学ぶ',
    description:
      'プロンプトエンジニアリングからAPI活用・RAG/エージェントまで、実践的なハンズオンを通じて学べる日本語学習プラットフォーム',
    url: `${BASE_URL}/lessons`,
    inLanguage: 'ja',
    provider: {
      '@type': 'Organization',
      name: 'AI Learning',
      url: BASE_URL,
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
    },
    numberOfCredits: lessons.length,
    educationalLevel: 'beginner to advanced',
  };
}

export function lessonSchema(lesson: Lesson) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: lesson.title,
    description: `${lesson.chapterTitle} | ${lesson.duration}分で学ぶ生成AIレッスン`,
    url: `${BASE_URL}/lessons/${lesson.slug}`,
    inLanguage: 'ja',
    learningResourceType: 'lesson',
    educationalLevel: lesson.difficulty,
    timeRequired: `PT${lesson.duration}M`,
    isPartOf: {
      '@type': 'Course',
      name: 'AI Learning — 生成AIを体系的に学ぶ',
      url: `${BASE_URL}/lessons`,
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
