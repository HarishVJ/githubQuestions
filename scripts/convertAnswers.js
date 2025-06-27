import fs from 'fs';
import path from 'path';

// Read the questions.json file
const questionsPath = path.join(process.cwd(), 'src', 'data', 'questions.json');
const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

// Convert all correctAnswer values to arrays
questions.forEach(question => {
  if (!Array.isArray(question.correctAnswer)) {
    question.correctAnswer = [question.correctAnswer];
  }
});

// Write the updated questions back to the file
fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2), 'utf8');

console.log('Successfully converted all correctAnswer values to arrays');
