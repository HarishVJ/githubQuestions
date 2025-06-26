import express from 'express';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());

app.get('/api/questions', async (req, res) => {
  try {
    const certificateMaterialPath = join(__dirname, '..', 'Certificate_Material');
    const files = await fs.readdir(certificateMaterialPath);
    const textFiles = files.filter(file => file.endsWith('.txt'));

    if (textFiles.length === 0) {
      throw new Error('No text files found in Certificate_Material directory');
    }

    let allContent = '';
    for (const file of textFiles) {
      try {
        const content = await fs.readFile(join(certificateMaterialPath, file), 'utf-8');
        if (content.trim()) {
          allContent += '\n' + content.trim() + '\n';
        }
      } catch (fileError) {
        console.error(`Error reading file ${file}:`, fileError);
      }
    }

    if (!allContent.trim()) {
      throw new Error('No content found in any of the text files');
    }

    res.send(allContent);
  } catch (error) {
    console.error('Error reading questions:', error);
    res.status(500).send(`Error loading questions: ${error.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
