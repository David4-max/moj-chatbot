const express = require('express');
const { OpenAI } = require('openai');
require('dotenv').config();
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(cors());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const companyInfo = fs.readFileSync('firma.txt', 'utf8');

app.post('/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: `Si asistent firmy. Odpovedaj iba na základe týchto informácií: ${companyInfo}. Ak nevieš odpoveď, povedz 'Ospravedlňujem sa, nemám informáciu o tejto téme.'` },
        { role: 'user', content: message },
      ],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error('Chyba pri komunikácii s OpenAI:', error);
    res.status(500).json({ reply: 'Ospravedlňujem sa, nastala chyba. Skús to neskôr.' });
  }
});

// Táto časť je zmenená, aby sa aplikácia dala exportovať
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server beží na http://localhost:${port}`);
  });
}

module.exports = app;