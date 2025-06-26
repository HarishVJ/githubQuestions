import type { Question } from '../types/types';

export async function loadQuestionsFromFiles(): Promise<Question[]> {
  try {
    const response = await fetch('/.netlify/functions/questions');
    if (!response.ok) {
      throw new Error(`Failed to load questions: ${response.statusText}`);
    }
    const questions = await response.json();
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('No valid questions received');
    }
    return questions;
  } catch (error) {
    console.error('Error loading questions:', error);
    throw error;
  }
}
