const express = require('express');
const app = express();
const cors = require('cors');
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
const lounges = require('./db/lounges');
const activeLounges = require('./db/activeLounges');

// Load configurations
const config = require('./config.json');
const { ObjectId } = require('mongodb');

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

// TODO: configure cors to only allow webapp origin
app.use(cors());

app.get('/', (_, res) => {
  res.send('Hello World!');

  // users.getUser('chaarlesmusic').then(data => console.log(data));
  // users.saveUser();
});

// User

app.use(bodyParser.json());
app.post('/user', (req, res) => {
  console.log('request data:', req.body);

  const spotifyId = _.get(req.body, 'spotify_id');

  if (spotifyId) {
    users.createUser(spotifyId)
      .then(_ => res.send('User created'))
      .catch(_ => res.sendStatus(500));  
  }
  else res.sendStatus(406);
});

app.get('/user', (req, res) => {
  console.log('request data:', req.query);

  // res.sendStatus(404);
  // return;

  const spotifyId = _.get(req.query, 'spotify_id');
  const userId = _.get(req.query, 'user_id');

  if (spotifyId) {
    users.getUserBySpotifyId(spotifyId)
      .then(data => {
        if (data) res.send(data);
        else res.status(404).send({ reason: 'spotifyUserNotFound' });
      })
      .catch(_ => res.sendStatus(500));
  }
  else if (userId) {
    users.getUserById(userId)
      .then(data => {
        if (data) res.send(data);
        else res.status(404).send({ reason: 'loungeUserNotFound' });
      })
      .catch(_ => res.sendStatus(500));
  }
  else res.sendStatus(406);
});

// Lounge

app.use(bodyParser.json());
app.post('/lounge', (req, res) => {
  console.log('request data:', req.body);

  const hostId = _.get(req.body, 'host_id');
  const name = _.get(req.body, 'name');
  const refreshToken = _.get(req.body, 'refresh_token');
  // TODO: remove here and generate in active lounges
  const code = commonUtils.createBase36(6);

  // create lounge
  lounges.createLounge({ hostId, name, code, refreshToken })
    .then(lounge => {
      // TODO: maybe use Schema middleware??

      // update user's lounge array
      return users.updateUserLounges({
        userId: hostId,
        lounge: {
          _id: lounge._id,
          name: lounge.name,
          code: lounge.code,
        },
      });
    })
    .then(_ => res.send('Lounge created'))
    .catch(_ => res.sendStatus(500));  
});

app.get('/lounge', (req, res) => {
  console.log('request data:', req.query);

  const loungeId = req.query?.lounge_id;

  lounges.getLounge(loungeId)
    .then(data => {
      if (data) res.send(data);
      else res.status(404).send({ reason: 'loungeNotFound' });
    })
    .catch(_ => res.sendStatus(500));
});

app.post('/lounge/open', (req, res) => {
  console.log('request data:', req.body);

  const userId = req.body?.user_id;
  const loungeId = req.body?.lounge_id;

  users.getUserById(userId)
    .then(user => {
      const { activeLoungeId } = user;
      if (!activeLoungeId) return Promise.resolve();
      else res.status(409).send({ reason: 'activeLoungeAlreadyExists' });
    })
    .then(_ => {
      return lounges.getLounge(loungeId);
    })
    .then(lounge => {
      const { code } = lounge;

      // open lounge
      return activeLounges.createActiveLounge({ loungeId, code });
    })
    .then(activeLounge => {
      res.send(activeLounge);

      // update user active lounge
      const activeLoungeId = activeLounge.loungeId;
      return users.updateUserActiveLounge({ userId, activeLoungeId });
    })
    .catch(_ => res.sendStatus(500));
});

app.post('/lounge/close', (req, res) => {
  console.log('request data:', req.body);

  const userId = req.body?.user_id;
  const loungeId = req.body?.lounge_id;

  // close lounge
  activeLounges.deleteActiveLounge(loungeId)
    .then(_ => {
      res.send('Lounge closed');

      // remove user active lounge
      return users.updateUserActiveLounge({ userId, activeLoungeId: null });
    })
    .catch(_ => res.sendStatus(500));
});

app.get('/lounge/join', (req, res) => {
  console.log('request data:', req.query);

  const code = req.query?.code;

  activeLounges.getActiveLoungeByCode(code)
    .then(data => {
      if (data) res.send(data);
      else res.status(404).send({ reason: 'activeLoungeNotFound' });
    })
    .catch(_ => res.sendStatus(500));
});

// Test

app.put('/user/test', (req, res) => {
  console.log('request data:', req.body);

  const userId = req.body?.user_id;
  const activeLoungeId = req.body?.lounge_id;

  users.updateUserActiveLounge({ userId, activeLoungeId: ObjectId(activeLoungeId) })
    .then(data => res.send(data))
    .catch(_ => res.sendStatus(500));
});

// Start server
const { sslPort } = config;
server.listen(sslPort, () => {
  console.log(`App listening on port ${sslPort}!`);
});
