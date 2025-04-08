const express = require('express');
const path = require('path');
const EventEmitter = require('events');
const app = express();
const port = process.env.PORT || 3000;

// Event emitter instance for broadcasting chat messages
const chatEmitter = new EventEmitter();

// Static files middleware
app.use(express.static(path.join(__dirname, 'public')));

// Serve chat.html on root path
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'chat.html'));
});

// Handle plain text response
app.get('/greet', (req, res) => {
  res.type('text/plain');
  res.send('Hello, welcome to the chat app!');
});

// JSON response endpoint
app.get('/info', (req, res) => {
  res.json({
    message: 'Welcome to the chat server!',
    availableCommands: ['/greet', '/info', '/echo', '/chat', '/sse'],
  });
});

// Echo input string with transformations
app.get('/transform', (req, res) => {
  const { input = '' } = req.query;
  if (!input) {
    return res.status(400).json({ error: 'No input provided!' });
  }
  
  res.json({
    original: input,
    uppercase: input.toUpperCase(),
    reversed: input.split('').reverse().join(''),
    length: input.length,
  });
});

// Handle incoming chat messages
app.get('/message', (req, res) => {
  const { message } = req.query;
  if (message) {
    chatEmitter.emit('newMessage', message);
    return res.status(200).send('Message received!');
  }
  res.status(400).send('No message provided.');
});

// Stream chat messages to connected clients using SSE
app.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Flush headers immediately for streaming

  const messageHandler = (msg) => {
    res.write(`data: ${msg}\n\n`);
  };

  chatEmitter.on('newMessage', messageHandler);

  // Clean up when client disconnects
  req.on('close', () => {
    chatEmitter.removeListener('newMessage', messageHandler);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
