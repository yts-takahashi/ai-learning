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
