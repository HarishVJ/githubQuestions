export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number | number[];
  domain: string;
}

export interface RawQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  domain: string;
}

export interface AssessmentState {
  currentQuestionIndex: number;
  score: number;
  totalQuestions: number;
  answers: number[];
  questions: Question[];
}
