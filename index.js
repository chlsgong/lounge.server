const express = require('express');
const app = express();
const fs = require('fs');
const https = require('https');
// const server = require('http').createServer(app);
const server = https.createServer({
  key: fs.readFileSync('ssl/chlsgong_com.key'),
  cert: fs.readFileSync('ssl/chlsgong_com.crt'),
}, app);
const io = require('socket.io')(server);

// Load configurations
const config = require('./config.json');

// Socket

io.on('connect', socket => {
  socket.on('create-lounge', data => {
    console.log('host created a lounge', data);

    this.token = data.token;
  });

  socket.on('join-lounge', data => {
    console.log('user joined this lounge');

    io.emit('pass-token', { token: this.token });
  });

  socket.on('add-to-queue', data => {
    console.log(data);
    
    io.emit('add-to-queue', data);
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
