require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const portfolioKnowledge = require('./portfolioKnowledge');

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: 'http://new-alb-141779744.ap-southeast-1.elb.amazonaws.com',  // ALB DNS
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));  // Apply CORS options
// app.use(cors());
app.use(express.json());

// Debugging logs
console.log("Server starting...");
console.log("OpenRouter API Key:", process.env.OPENROUTER_API_KEY ? "Loaded" : "Not Found");

// Chatbot endpoint that handles user messages
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("Missing OPENROUTER_API_KEY!");
    return res.status(500).json({ error: "Server misconfiguration: Missing API key" });
  }

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-chat:free', // Change to Deepseek R1
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant helping users learn about Jia Jing's portfolio website. Use the following context to answer questions: ${portfolioKnowledge} Please give your answers in very short sentences and do not output your reasoning to getting the answers.`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.YOUR_SITE_URL || '',
          'X-Title': process.env.YOUR_SITE_NAME || '',
        },
      }
    );

    if (response.data.choices && response.data.choices.length > 0) {
      res.json({ botResponse: response.data.choices[0].message.content });
    } else {
      res.status(500).json({ error: 'No valid response from AI' });
    }
  } catch (error) {
    console.error('Error interacting with OpenRouter API:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
