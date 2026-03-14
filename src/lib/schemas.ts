import { z } from 'zod';

export const LessonFrontmatterSchema = z.object({
  title: z.string(),
  chapter: z.number().int().positive(),
  chapterTitle: z.string(),
  lessonNumber: z.number().int().positive(),
  slug: z.string(),
  duration: z.number().int().positive(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  hasHandsOn: z.boolean(),
  hasQuiz: z.boolean(),
});
