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
const API_URL = '/api/chat';
  apiKey: process.env.OPENAI_API_KEY,
});

const companyInfo = fs.readFileSync('firma.txt', 'utf8');

app.post('/chat', async (req, res) => {
  const { message } = req.body;

  try {
const systemMessage = {
  role: "system",
  content: "Si milý a užitočný asistent zákazníckej podpory. Tvojou hlavnou úlohou je poskytovať presné a zdvorilé odpovede, ktoré pomôžu zákazníkom s ich otázkami. Používaj informácie, ktoré máš k dispozícii, ale vždy buď priateľský a ochotný. Ak nevieš na otázku odpovedať, odpovedz presne vetou: 'Ospravedlňujem sa, s týmto vám neviem pomôcť.' "
};
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