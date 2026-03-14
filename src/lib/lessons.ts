import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Lesson, Chapter } from './types';
import { CHAPTERS } from './constants';
import { LessonFrontmatterSchema } from './schemas';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'lessons');

function getChapterDir(chapterNum: number): string {
  return path.join(CONTENT_DIR, `chapter-${String(chapterNum).padStart(2, '0')}`);
}

function parseLessonFile(filePath: string): Lesson | null {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    const result = LessonFrontmatterSchema.safeParse(data);
    if (!result.success) {
      console.warn(`Invalid frontmatter in ${filePath}:`, result.error.flatten().fieldErrors);
      return null;
    }
    return {
      ...result.data,
      content,
      filePath,
    };
  } catch {
    return null;
  }
}

export function getAllLessons(): Lesson[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }

  const lessons: Lesson[] = [];

  try {
    const chapterDirs = fs.readdirSync(CONTENT_DIR).filter((dir) => {
      const fullPath = path.join(CONTENT_DIR, dir);
      return fs.statSync(fullPath).isDirectory();
    });

    for (const chapterDir of chapterDirs.sort()) {
      const chapterPath = path.join(CONTENT_DIR, chapterDir);
      const files = fs.readdirSync(chapterPath).filter((f) => f.endsWith('.md'));

      for (const file of files.sort()) {
        const filePath = path.join(chapterPath, file);
        const lesson = parseLessonFile(filePath);
        if (lesson) {
          lessons.push(lesson);
        }
      }
    }
  } catch {
    return [];
  }

  return lessons;
}

export function getLessonBySlug(slug: string): Lesson | null {
  const allLessons = getAllLessons();
  return allLessons.find((lesson) => lesson.slug === slug) ?? null;
}

export function getLessonsByChapter(chapterNum: number): Lesson[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }

  const chapterDir = getChapterDir(chapterNum);
  if (!fs.existsSync(chapterDir)) {
    return [];
  }

  const lessons: Lesson[] = [];

  try {
    const files = fs.readdirSync(chapterDir).filter((f) => f.endsWith('.md'));

    for (const file of files.sort()) {
      const filePath = path.join(chapterDir, file);
      const lesson = parseLessonFile(filePath);
      if (lesson) {
        lessons.push(lesson);
      }
    }
  } catch {
    return [];
  }

  return lessons.sort((a, b) => a.lessonNumber - b.lessonNumber);
}

export function getChapters(): Chapter[] {
  return CHAPTERS.map((chapterInfo) => {
    const lessons = getLessonsByChapter(chapterInfo.number);
    return {
      number: chapterInfo.number,
      title: chapterInfo.title,
      description: chapterInfo.description,
      lessons,
    };
  });
}

export function getAdjacentLessons(slug: string): {
  prev: Lesson | null;
  next: Lesson | null;
} {
  const allLessons = getAllLessons();
  const index = allLessons.findIndex((l) => l.slug === slug);

  if (index === -1) {
    return { prev: null, next: null };
  }

  return {
    prev: index > 0 ? allLessons[index - 1] : null,
    next: index < allLessons.length - 1 ? allLessons[index + 1] : null,
  };
}
