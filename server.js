const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
   cors: {origin: '*'}
});
const PORT = process.env.PORT || 4000;

io.on('connection', socket => {
   socket.on('chatMessage', msg => {
      if(msg.user == 'admin') {
         io.to(msg.to).emit('message', msg)
      } else{
         io.emit('message', {...msg, to: 'admin'})
      }
   })
})

server.listen(PORT, () => console.log("Server Runnin' Nigga"))