import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the questions file
const questionsPath = join(__dirname, '..', 'src', 'data', 'questions.json');
const questions = JSON.parse(readFileSync(questionsPath, 'utf8'));

// Create a map to store unique questions by text
const uniqueQuestions = new Map();
const duplicates = [];

// Process each question
questions.forEach(question => {
    if (uniqueQuestions.has(question.text)) {
        duplicates.push({
            id: question.id,
            text: question.text,
            duplicateOf: uniqueQuestions.get(question.text).id
        });
    } else {
        uniqueQuestions.set(question.text, question);
    }
});

// Convert map back to array and sort by id
const finalQuestions = Array.from(uniqueQuestions.values())
    .sort((a, b) => a.id - b.id);

// Save the unique questions back to the file
writeFileSync(questionsPath, JSON.stringify(finalQuestions, null, 2));

// Log results
console.log(`Original questions count: ${questions.length}`);
console.log(`Final questions count: ${finalQuestions.length}`);
console.log('\nDuplicate questions removed:');
duplicates.forEach(dup => {
    console.log(`ID ${dup.id} is duplicate of ID ${dup.duplicateOf}: "${dup.text.substring(0, 100)}..."`);
});
