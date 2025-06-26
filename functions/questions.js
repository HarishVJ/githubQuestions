const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    // Read the consolidated.txt file
    const filePath = path.join(__dirname, '..', 'Certificate_Material', 'consolidated.txt');
    const content = fs.readFileSync(filePath, 'utf-8');

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

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(questions)
    };
  } catch (error) {
    console.error('Error processing questions:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to process questions' })
    };
  }
};
