import type { Question } from '../types/types';

interface RawQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  domain: string;
}

function parseTextContent(content: string): RawQuestion[] {
  const questions: RawQuestion[] = [];
  let currentDomain = '';
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;

    // Check for domain headers
    if (line.startsWith('### Domain')) {
      currentDomain = line.replace('### ', '').trim();
      continue;
    }

    // Check for numbered questions
    const questionMatch = line.match(/^\d+\. \*\*(.*?)\*\*/);
    if (questionMatch) {
      const questionText = questionMatch[1];
      const options: string[] = [];
      let correctAnswer = '';

      // Look for options and answer
      let j = i + 1;
      while (j < lines.length) {
        let optionLine = lines[j].trim();
        if (!optionLine) break;

        if (optionLine.startsWith('a)') || 
            optionLine.startsWith('b)') || 
            optionLine.startsWith('c)') || 
            optionLine.startsWith('d)')) {
          options.push(optionLine.substring(2).trim());
        } else if (optionLine.startsWith('**Answer:')) {
          correctAnswer = optionLine.match(/\*\*Answer: (\w+)\*\*/)?.[1] || '';
          break;
        }
        j++;
      }

      if (questionText && options.length === 4 && correctAnswer) {
        questions.push({
          question: questionText,
          options,
          correctAnswer,
          domain: currentDomain
        });
      }
    }
  }

  return questions;
}

export async function loadQuestionsFromFiles(): Promise<Question[]> {
  try {
    const response = await fetch('/api/questions');
    if (!response.ok) {
      throw new Error(`Failed to load questions: ${response.statusText}`);
    }
    const content = await response.text();
    if (!content.trim()) {
      throw new Error('No question content received');
    }

    const rawQuestions = parseTextContent(content);
    if (rawQuestions.length === 0) {
      throw new Error('No valid questions found in the content');
    }
    
    const questions: Question[] = rawQuestions.map((q, index) => {
      const correctAnswerIndex = ['a', 'b', 'c', 'd'].indexOf(q.correctAnswer.toLowerCase());
      
      return {
        id: index + 1,
        text: q.question,
        options: q.options,
        correctAnswer: correctAnswerIndex >= 0 ? correctAnswerIndex : 0,
        domain: q.domain
      };
    });

    return questions;
  } catch (error) {
    console.error('Error loading questions:', error);
    throw error;
  }
}
