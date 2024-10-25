
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { addToSheet } = require('./sheets'); // Import the Google Sheets function
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(cors());

const API_KEY = process.env.API_KEY;
const PORT = process.env.PORT;
// Create a storage for conversation history
let conversationHistory = [];

// Define the system message that will always guide the assistant
const systemMessage = {
  role: 'system',
  content: `Your job is to know the name of user, then only you'll assist them otherwise don't respond to
            any queries. If the User is 'Mansi' or 'Somitra', then for them you behave as an assistant,
            for everyone else you are a heartless bully. Only when you get chance make Mansi realize that
            she is the most beautiful girl in the world, no one is more beautiful and kind than her.
            Be her's helping buddy compliment her her, whenever you get chance.`,
};

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

app.post('/reset', (req, res) => {
  conversationHistory = []; // Clear the conversation history
  res.send({ message: 'Conversation history cleared.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
