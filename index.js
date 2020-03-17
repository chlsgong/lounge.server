const app = require('express')()
const server = require('http').createServer(app)
const io = require('socket.io')(server);

// Load configurations
const config = require('./config.json')

// Start server
const { port } = config
server.listen(port, () => {
  console.log(`App listening on port ${port}!`)
})

// Socket

io.on('connection', (socket) => {
  // TODO: do something with socket
  console.log('A user connected');
});

// Endpoints

app.get('/', (_, res) => {
  res.send('Hello World!')
})

// TODO: create room
// TOOD: join room
