require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const Groq = require("groq-sdk");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const SYSTEM_PROMPT = `You are an AI Geography Quiz Chatbot named "GeoBot".

PRIMARY GOAL:
Create an interactive chat experience where users can both:
1. Play a geography quiz
2. Ask geography-related questions

MODE HANDLING:

1. QUIZ MODE (default):
- Start the conversation with a geography question
- Ask only ONE question at a time
- Wait for user response before continuing
After user answers:
- Respond with: Correct ✅ OR Wrong ❌
- Provide the correct answer
- Give a short one-line explanation
- Then ask the next question

2. QUESTION MODE:
- If the user asks a geography-related question (not answering a quiz question):
  - Give a clear, short answer (max 2–3 lines)
  - Then continue quiz by asking next question

STRICT TOPIC CONTROL:
ONLY allow geography topics:
- Countries and capitals
- Rivers, mountains, deserts
- Continents and oceans
- Climate and environment
- Maps and locations
- Population and physical geography

If the user asks anything NOT related to geography, reply EXACTLY:
"I only answer geography-related questions."

ANSWER EVALUATION RULES:
- Ignore case sensitivity
- Accept close variations if meaning is correct
- If partially correct → mark as Wrong ❌ and show correct answer

CHAT STYLE:
- Keep responses short and chat-like
- Friendly tone (like WhatsApp chat)
- Avoid long paragraphs
- Do not over-explain
- Use emojis occasionally to keep it fun

QUIZ RULES:
- Mix easy, medium, and hard questions
- Do not repeat questions frequently
- Keep the flow engaging

MEMORY:
- Continue quiz naturally across the conversation
- Do not restart unless user says "restart"
- Track score mentally and mention it occasionally

STRICT LIMITS:
- Do NOT answer coding, math, history, or general knowledge questions
- Do NOT break character
- Do NOT ask multiple questions at once

IMPORTANT: When starting a fresh conversation, immediately ask the first question.`;

// Sessions (UNCHANGED)
const sessions = {};

// ================= CHAT =================
app.post("/api/chat", async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({ error: "message and sessionId are required" });
    }

    if (!sessions[sessionId]) {
      sessions[sessionId] = [];
    }

    const history = sessions[sessionId];

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map(m => ({
        role: m.role === "model" ? "assistant" : "user",
        content: m.parts[0].text
      })),
      { role: "user", content: message }
    ];

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
      temperature: 0.7,
      max_tokens: 512
    });

    const text = response.choices[0].message.content;

    // Save history (UNCHANGED FORMAT)
    sessions[sessionId].push({
      role: "user",
      parts: [{ text: message }]
    });

    sessions[sessionId].push({
      role: "model",
      parts: [{ text: text }]
    });

    if (sessions[sessionId].length > 30) {
      sessions[sessionId] = sessions[sessionId].slice(-30);
    }

    res.json({ reply: text });

  } catch (error) {
    console.error("Groq API error:", error.message);
    res.status(500).json({ error: "Failed to get response from AI." });
  }
});

// ================= START =================
app.post("/api/start", async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    sessions[sessionId] = [];

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: "Start the quiz! Ask me the first question." }
      ],
      temperature: 0.8,
      max_tokens: 256
    });

    const text = response.choices[0].message.content;

    sessions[sessionId].push({
      role: "user",
      parts: [{ text: "Start the quiz! Ask me the first question." }]
    });

    sessions[sessionId].push({
      role: "model",
      parts: [{ text: text }]
    });

    res.json({ reply: text });

  } catch (error) {
    console.error("Start error:", error.message);
    res.status(500).json({ error: "Failed to start quiz." });
  }
});

app.listen(PORT, () => {
  console.log(`🌍 GeoBot server running at http://localhost:${PORT}`);
  console.log(`📝 Make sure GROQ_API_KEY is set in your .env file\n`);
});