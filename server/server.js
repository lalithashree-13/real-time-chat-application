// server/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

let users = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (username) => {
    users.push(username);
    io.emit('user-list', users);
    io.emit('system', `${username} joined the chat`);
  });

  socket.on('message', (msg) => {
    io.emit('message', msg);
  });

  socket.on('typing', (username) => {
    socket.broadcast.emit('typing', { user: username });
  });

  socket.on('stop-typing', (username) => {
    socket.broadcast.emit('stop-typing', { user: username });
  });

  socket.on('disconnect', () => {
    users = users.filter(u => u !== socket.username);
    io.emit('user-list', users);
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
