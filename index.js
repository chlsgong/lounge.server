require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');
const socket = require('socket.io');
const _ = require('lodash');
const { ObjectId } = require('mongodb');

const commonUtils = require('./utils/common');
const mongooseClient = require('./db/mongoose-client');
const users = require('./db/users');
const lounges = require('./db/lounges');
const activeLounges = require('./db/activeLounges');

const getKey = () => {
  const { SERVER_ENV, DEV_KEY, PROD_KEY } = process.env;
  const key = SERVER_ENV === 'dev' ? DEV_KEY : PROD_KEY;
  return fs.readFileSync(key);
};

const getCert = () => {
  const { SERVER_ENV, DEV_CERT, PROD_CERT } = process.env;
  const cert = SERVER_ENV === 'dev' ? DEV_CERT : PROD_CERT;
  return fs.readFileSync(cert);
};

// Create server
const server = https.createServer({
  key: getKey(),
  cert: getCert(),
}, app);

// CORS

const originWhitelist = [
  'http://localhost:3000',
  'https://localhost:3000',
  'https://chlsgong.com',
];

const methodWhitelist = [
  'GET',
  'POST',
  'PUT',
];

const corsOptions = {
  origin: originWhitelist,
  methods: methodWhitelist,
};

// Socket IO

const io = socket(server, { cors: corsOptions });

io.on('connect', socket => {
  console.log('a user connected');

  socket.on('open-lounge', data => {
    const { loungeId } = data;	
    console.log('open lounge:', loungeId);
    socket.join(loungeId);

    // const ids = await io.in(loungeId).allSockets();
    // console.log('sockets in room', ids);
  });	

  socket.on('join-lounge', data => {
    const { loungeId } = data;	
    console.log('join lounge:', loungeId);
    socket.join(loungeId);

    // const ids = await io.in(loungeId).allSockets();
    // console.log('sockets in room', ids);
  });

  socket.on('close-lounge', data => {
    const { loungeId } = data;	
    console.log('close lounge:', loungeId);

    // Notify all guests in this room that they have been kicked
    socket.in(loungeId).emit('lounge-closed');

    io.in(loungeId).allSockets()
      .then(ids => {
        // console.log('sockets in room', ids);

        // Remove all sockets in the room
        ids.forEach(id => io.sockets.sockets?.get(id)?.leave(loungeId));
      });
  });

  socket.on('disconnect', reason => {
    console.log('disconnect', reason);

    // Socket gets automatically removed from rooms if disconnected
  });
});

// Connect to database
mongooseClient.connect();

// Endpoints

app.use(cors(corsOptions));

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
  const code = commonUtils.createCode(6);

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
const { SSL_PORT } = process.env;
server.listen(SSL_PORT, () => {
  console.log(`App listening on port ${SSL_PORT}!`);
});
