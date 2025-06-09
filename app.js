const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path'); // Add path for serving React's static files
const { addToSheet } = require('./sheets'); // Import the Google Sheets function
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const API_KEY = process.env.API_KEY;
const PORT = process.env.PORT || 5000;

// Create a storage for conversation history
let conversationHistory = [];

// Define the system message that will always guide the assistant
const systemMessage = {
  role: 'system',
  content: `Your Job is to be a helpful assistant to the user.`,
};

// Serve static files from the React frontend build folder
app.use(express.static(path.join(__dirname, 'build')));

// API route to handle completions
app.post('/completions', async (req, res) => {
  // Add the new message to the conversation history
  const userMessage = { role: 'user', content: req.body.message };
  conversationHistory.push(userMessage);

  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [systemMessage, ...conversationHistory],
      max_tokens: 500,
    }),
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', options);
    const data = await response.json();

    // Store the assistant's reply to maintain the conversation flow
    const assistantReply = data.choices[0].message;
    conversationHistory.push(assistantReply);

    // Save conversation to Google Sheet
    const timestamp = new Date().toISOString();
    const sheetData = [
      [timestamp, userMessage.role, userMessage.content],
      [timestamp, assistantReply.role, assistantReply.content],
    ];
    await addToSheet(sheetData);

    res.send(data);
  } catch (err) {
    console.log(err);
    res.status(500).send('An error occurred.');
  }
});

// API route to reset conversation history
app.post('/reset', (req, res) => {
  conversationHistory = []; // Clear the conversation history
  res.send({ message: 'Conversation history cleared.' });
});

// Serve the React frontend for all other routes (any route that doesn’t match an API route)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
