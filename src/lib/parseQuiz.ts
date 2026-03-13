import { QuizQuestion } from './types';

/**
 * Parses a Markdown-format quiz block into structured QuizQuestion objects.
 *
 * Expected format per question:
 * **Q1. Question text?**
 *
 * - A) Option A
 * - B) Option B
 * - C) Option C
 * - D) Option D
 *
 * **正解: B**
 * **解説:** Explanation text
 */
export function parseQuizMarkdown(markdown: string): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  // Split by question blocks starting with **Q or Q followed by number
  const questionBlocks = markdown.split(/(?=\*\*Q\d+[\.\．]|\bQ\d+[\.\．])/);

  for (const block of questionBlocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Extract question text: **Q1. ...** or Q1. ...
    const questionMatch = trimmed.match(/\*?\*?Q\d+[\.\．]\s*(.*?)\*?\*?\n/);
    if (!questionMatch) continue;

    const question = questionMatch[1].trim();

    // Extract options: - A) ... or - A. ... or * A) ...
    const optionMatches = trimmed.matchAll(/[-*]\s+([A-D])[)\.）]\s+(.+)/g);
    const options: string[] = [];
    const optionLetters: string[] = [];

    for (const match of optionMatches) {
      optionLetters.push(match[1]);
      options.push(match[2].trim());
    }

    if (options.length === 0) continue;

    // Extract correct answer: **正解: B** or 正解: B
    const correctMatch = trimmed.match(/\*?\*?正解[:：]\s*([A-D])\*?\*?/);
    if (!correctMatch) continue;
    const correctLetter = correctMatch[1];
    const correctIndex = optionLetters.indexOf(correctLetter);
    if (correctIndex === -1) continue;

    // Extract explanation: **解説:** ... or 解説: ...
    const explanationMatch = trimmed.match(/\*?\*?解説[:：]\*?\*?\s*([\s\S]+?)(?=\n\n|\n\*\*Q|\n---|\n##|$)/);
    const explanation = explanationMatch ? explanationMatch[1].trim() : '';

    questions.push({
      question,
      options,
      correctIndex,
      explanation,
    });
  }

  return questions;
}
