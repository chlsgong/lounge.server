const express = require('express');
const app = express();
const fs = require('fs');
const https = require('https');
const socketIO = require('socket.io');

const loungeMgr = require('./lounge-manager');

// Load configurations
const config = require('./config.json');

// Create server
const server = https.createServer({
  key: fs.readFileSync('ssl/chlsgong_com.key'),
  cert: fs.readFileSync('ssl/chlsgong_com.crt'),
}, app);
const io = socketIO(server);

// Socket

io.on('connect', socket => {
  socket.on('create-lounge', data => {
    const { id } = socket;
    const { token } = data;

    console.log('host created a lounge:', id);
    console.log('token:', data);

    loungeMgr.add(id, token);
  });

  socket.on('join-lounge', data => {
    const { id } = data;

    console.log('user joined this lounge:', id);
    
    socket.join(id, () => {
      const lounge = loungeMgr.get(id);

      if (!lounge) {
        io.to(socket.id).emit('lounge-not-found', { id });
        return;
      }

      io.to(socket.id).emit('pass-token', { token: lounge.token });
    });
  });

  socket.on('add-to-queue', data => {
    console.log(data);
    
    io.to(data.id).emit('add-to-queue', data );
  });
});

// Endpoints

app.get('/', (_, res) => {
  res.send('Hello World!');
});

// Start server
const { sslPort } = config;
server.listen(sslPort, () => {
  console.log(`App listening on port ${sslPort}!`);
});
