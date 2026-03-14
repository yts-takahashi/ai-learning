export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  const lines = markdown.split('\n');
  for (const line of lines) {
    const m2 = line.match(/^##\s+(.+)/);
    const m3 = line.match(/^###\s+(.+)/);
    if (m2) {
      const text = m2[1].trim();
      headings.push({ id: slugifyHeading(text), text, level: 2 });
    } else if (m3) {
      const text = m3[1].trim();
      headings.push({ id: slugifyHeading(text), text, level: 3 });
    }
  }
  return headings;
}

/**
 * Splits lesson Markdown content into article, handson, and quiz sections.
 *
 * Conventions:
 *   ## ハンズオン  → starts handson section
 *   <!-- QUIZ:START --> ... <!-- QUIZ:END -->  → quiz section
 *
 * Everything before ## ハンズオン is the article.
 */
export function parseLessonContent(content: string): {
  article: string;
  handson: string | null;
  quiz: string | null;
} {
  // Extract quiz block
  const quizMatch = content.match(/<!--\s*QUIZ:START\s*-->([\s\S]*?)<!--\s*QUIZ:END\s*-->/);
  const quiz = quizMatch ? quizMatch[1].trim() : null;
  const contentWithoutQuiz = content.replace(
    /<!--\s*QUIZ:START\s*-->[\s\S]*?<!--\s*QUIZ:END\s*-->/,
    '',
  );

  // Split on ## ハンズオン heading
  const handsOnMatch = contentWithoutQuiz.match(/^([\s\S]*?)(^## ハンズオン[\s\S]*)$/m);

  if (handsOnMatch) {
    return {
      article: handsOnMatch[1].trim(),
      handson: handsOnMatch[2].trim(),
      quiz,
    };
  }

  return {
    article: contentWithoutQuiz.trim(),
    handson: null,
    quiz,
  };
}
