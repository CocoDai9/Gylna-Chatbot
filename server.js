import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { OpenAI } from "openai";

dotenv.config();
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `
You are a blood sugar management assistant.
Always reply using ONLY the following strict format, no extra text:

Suggested Food Items:
- Item 1
- Item 2
- Item 3

Exercise Recommendation:
- Exercise 1
- Exercise 2

Potential Risks:
- Risk 1
- Risk 2
- Risk 3

DO NOT add any introductions, explanations, summaries, or general advice.
DO NOT invent other headings.
Only fill in the items under each heading.
Keep each item practical and specific.
`
        },
        { role: "user", content: userMessage }
      ]
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("Error calling OpenAI:", err);
    res.status(500).json({ error: "OpenAI API error" });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
