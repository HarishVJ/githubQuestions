import type { Question } from '../types/types';
import questionsData from '../data/questions.json';

export async function loadQuestionsFromFiles(): Promise<Question[]> {
  try {
    if (!Array.isArray(questionsData) || questionsData.length === 0) {
      throw new Error('No valid questions found in questions.json');
    }
    return questionsData;
  } catch (error) {
    console.error('Error loading questions:', error);
    throw error;
  }
}
