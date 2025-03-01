require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const portfolioKnowledge = require('./portfolioKnowledge');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Chatbot endpoint that handles user messages
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
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
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.YOUR_SITE_URL || '', // Optional
          'X-Title': process.env.YOUR_SITE_NAME || '', // Optional
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

app.listen(port, () => {
  console.log(`Server running on http://18.139.217.58:${port}`);
});
