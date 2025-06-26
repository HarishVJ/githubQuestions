import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function convertToJson() {
  try {
    // Read the consolidated.txt file
    const filePath = join(__dirname, '..', 'Certificate_Material', 'consolidated.txt');
    const content = await fs.readFile(filePath, 'utf-8');

    // Parse questions from the content
    const questions = [];
    const questionRegex = /(?:^|\n)(\d+)\. \*\*(.*?)\*\*\s*([\s\S]*?)(?=(?:\n\d+\. \*\*|$))/g;
    const optionRegex = /\s+([A-Ea-e])\)\s*([^\n]+)/g;
    const answerRegex = /(?:\*\*Answer:[ ]*|Answer:[ ]*)([A-Ea-e](?:,\s*[A-Ea-e])*)/;

    let match;
    while ((match = questionRegex.exec(content)) !== null) {
      const [, id, text, details] = match;
      const options = [];
      const optionsMap = {};
      
      // Reset lastIndex for optionRegex
      optionRegex.lastIndex = 0;
      let optionMatch;
      while ((optionMatch = optionRegex.exec(details)) !== null) {
        const [, letter, optionText] = optionMatch;
        const normalizedLetter = letter.toLowerCase();
        options.push(optionText.trim());
        optionsMap[normalizedLetter] = options.length - 1;
      }

      // Only process if we found options
      if (options.length > 0) {
        const answerMatch = details.match(answerRegex);
        if (answerMatch) {
          const answers = answerMatch[1].split(',').map(a => a.trim().toLowerCase());
          const correctAnswerIndex = optionsMap[answers[0]];

          // Extract domain from the question text or details
          const domainMatch = details.match(/Domain \d+: ([^(]+)/) || ['', 'GitHub Copilot Certification'];
          const domain = domainMatch[1].trim();

          if (correctAnswerIndex !== undefined) {
            questions.push({
              id: parseInt(id),
              text: text.trim(),
              options,
              correctAnswer: correctAnswerIndex,
              domain
            });
          }
        }
      }
    }

    // Sort questions by ID
    questions.sort((a, b) => a.id - b.id);

    // Write to JSON file
    const outputPath = join(__dirname, '..', 'src', 'data', 'questions.json');
    await fs.mkdir(dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(questions, null, 2));
    console.log('Successfully converted questions to JSON');
  } catch (error) {
    console.error('Error converting questions:', error);
    process.exit(1);
  }
}

convertToJson();

