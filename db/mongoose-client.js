const mongoose = require('mongoose');

// Connection URL
const url = 'mongodb://localhost/lounge';

// Use connect method to connect to the Server
const connect = () => {
  mongoose.connect(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
    .then(() => console.log("Connected successfully to server"))
    .catch(err => console.log("Error connecting to server", err));
}

module.exports = {
  connect,
};
