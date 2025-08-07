const express = require('express');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3000;

dotenv.config({ override: true });

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const companyInfo = fs.readFileSync('firma.txt', 'utf8');
const systemMessage = `
  Si milý a užitočný asistent zákazníckej podpory. Tvojou hlavnou úlohou je poskytovať presné a zdvorilé odpovede,
  ktoré pomôžu zákazníkom s ich otázkami. Používaj informácie, ktoré máš k dispozícii, ale vždy buď priateľský
  a ochotný. Ak nevieš na otázku odpovedať, odpovedz: "Pre túto otázku nemám informácie, ale rád vám pomôžem s inou otázkou."

  Informácie o firme:
  ${companyInfo}
`;

app.post('/chat', async (req, res) => {
  try {
    const message = req.body.message;
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: message }
      ],
      max_tokens: 150
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error('Chyba pri komunikácii s OpenAI:', error);
    res.status(500).json({ reply: 'Ospravedlňujem sa, nastala chyba. Skús to neskôr.' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server beží na http://localhost:${port}`);
  });
}

module.exports = app;

oprava ulozenia