const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');
const socketIO = require('socket.io');
const uuid = require('uuid');
const _ = require('lodash');

const loungeMgr = require('./lounge-manager');
const commonUtils = require('./utils/common');
const mongooseClient = require('./db/mongoose-client');
const users = require('./db/users');
// const lounges = require('./db/lounges');

// Load configurations
const config = require('./config.json');

// Create server
const server = https.createServer({
  key: fs.readFileSync('ssl/chlsgong_com.key'),
  cert: fs.readFileSync('ssl/chlsgong_com.crt'),
}, app);
const io = socketIO(server);

// Connect to database
mongooseClient.connect();

// Socket

io.on('connect', socket => {
  socket.on('create-lounge', data => {
    const { token } = data;
    const id = uuid.v4();
    const loungeCode = commonUtils.createBase36(6);

    console.log('host created a lounge:', id);
    console.log('lounge code:', loungeCode);
    console.log('token:', data);

    loungeMgr.add(id, loungeCode, token);

    socket.join(id, () => {
      io.to(id).emit('pass-lounge-code', { loungeCode });
    });
  });

  socket.on('join-lounge', data => {
    const { code } = data;

    console.log('user joined this lounge:', code);
    const id = _.get(loungeMgr.getLoungeId(code), 'id');

    if (!id) {
      socket.emit('lounge-not-found', { code });
      return;
    }

    socket.join(id, () => {
      const token = _.get(loungeMgr.getLounge(id), 'token');

      socket.emit('pass-lounge-info', {
        id,
        code,
        token,
      });
    });
  });

  socket.on('add-to-queue', data => {
    console.log(data);
    
    io.to(data.id).emit('add-to-queue', data);
  });
});

// Endpoints

app.get('/', (_, res) => {
  res.send('Hello World!');

  users.getUser('chaarlesmusic').then(data => console.log(data));
  // users.saveUser();
});

// User

app.use(bodyParser.json());
app.post('/user', (req, res) => {
  console.log('request data:', req.body);

  const spotifyId = _.get(req.body, 'spotifyId');

  if (spotifyId) res.sendStatus(200);
  else res.sendStatus(406);
});

app.get('/user', (req, res) => {
  console.log('request data:', req.query);

  const spotifyId = _.get(req.query, 'spotifyId');

  if (spotifyId) {
    users.getUser('chaarlesmusic')
      .then(data => res.send(data))
      .catch(_ => res.sendStatus(404));
  }
  else res.sendStatus(406);
});

// Start server
const { sslPort } = config;
server.listen(sslPort, () => {
  console.log(`App listening on port ${sslPort}!`);
});
