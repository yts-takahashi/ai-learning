export interface LessonFrontmatter {
  title: string;
  chapter: number;
  chapterTitle: string;
  lessonNumber: number;
  slug: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  hasHandsOn: boolean;
  hasQuiz: boolean;
}

export interface Lesson extends LessonFrontmatter {
  content: string;
  filePath: string;
}

export interface Chapter {
  number: number;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Progress {
  completedSlugs: string[];
  lastUpdated: string;
}
