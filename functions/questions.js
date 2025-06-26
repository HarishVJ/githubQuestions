const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  try {
    const questionsPath = path.join(__dirname, '../Certificate_Material/consolidated.txt');
    const content = fs.readFileSync(questionsPath, 'utf8');
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      },
      body: content
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to load questions' })
    };
  }
};
