const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});
const PORT = process.env.PORT || 4000;

// Store connected users: { username: socket.id }
const connectedUsers = new Map();
let adminSocketId = null; // Track admin’s socket ID

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Register username
  socket.on('register', (username) => {
    if (username === 'admin') {
      adminSocketId = socket.id; // Save admin’s socket ID
      console.log('Admin registered with socket ID:', adminSocketId);
    } else {
      connectedUsers.set(username, socket.id); // Normal user
      console.log('Registered:', username, 'with socket ID:', socket.id);
    }
    console.log('Connected users:', [...connectedUsers.entries()], 'Admin:', adminSocketId);
  });

  socket.on('chatMessage', (msg) => {
    console.log('Received message:', msg);
    if (msg.user === 'admin') {
      const targetSocketId = connectedUsers.get(msg.to); // Target user’s socket ID
      if (targetSocketId) {
        io.to(targetSocketId).emit('message', msg); // Admin to user
        console.log(`Admin sent to ${msg.to} (socket ${targetSocketId}):`, msg.text);
      } else {
        console.log(`User ${msg.to} not found`);
      }
    } else {
      // User to admin
      if (adminSocketId) {
        io.to(adminSocketId).emit('message', { ...msg, to: 'admin' }); // Send only to admin
        console.log(`User ${msg.user} sent to admin (socket ${adminSocketId}):`, msg.text);
      } else {
        console.log('Admin not connected, message dropped');
      }
    }
  });

  socket.on('disconnect', () => {
    if (socket.id === adminSocketId) {
      adminSocketId = null; // Admin disconnected
      console.log('Admin disconnected');
    } else {
      for (let [username, id] of connectedUsers) {
        if (id === socket.id) {
          connectedUsers.delete(username);
          console.log(`${username} disconnected`);
          break;
        }
      }
    }
    console.log('Remaining users:', [...connectedUsers.entries()], 'Admin:', adminSocketId);
  });
});

server.listen(PORT, () => console.log("Server Runnin' Nigga"));