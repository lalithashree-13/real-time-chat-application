const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // frontend origin
    methods: ["GET", "POST"]
  }
});

// Simple health route
app.get('/', (req, res) => {
  res.send({ status: 'ok', message: 'Real-time chat backend' });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // store username in socket (client sends 'join' first)
  socket.on('join', (username) => {
    socket.username = username || 'Anonymous';
    io.emit('systemMessage', { text: `${socket.username} joined the chat` });
  });

  // when a client sends a message
  socket.on('sendMessage', (msg) => {
    const payload = {
      id: Date.now(),
      user: socket.username || 'Anonymous',
      text: msg,
      timestamp: new Date().toISOString()
    };
    // broadcast to all clients
    io.emit('receiveMessage', payload);
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      io.emit('systemMessage', { text: `${socket.username} left the chat` });
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
