const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Load configurations
const config = require('./config.json');

// Socket

io.on('connect', socket => {
  // TODO: do something with socket
  console.log('A user connected');

  socket.on('add-to-queue', data => {
    console.log(data);
  })
});

// Endpoints

app.get('/', (_, res) => {
  res.send('Hello World!');
});

// TODO: create room
// TOOD: join room

// Start server
const { port } = config;
server.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});
