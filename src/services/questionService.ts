import type { Question } from '../types/types';
import questionsData from '../data/questions.json';

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function loadQuestionsFromFiles(): Promise<Question[]> {
  try {
    if (!Array.isArray(questionsData) || questionsData.length === 0) {
      throw new Error('No valid questions found in questions.json');
    }
    return shuffleArray(questionsData);
  } catch (error) {
    console.error('Error loading questions:', error);
    throw error;
  }
}
