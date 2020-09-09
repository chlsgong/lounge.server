const mongoose = require('mongoose');

// Connection URL
const url = 'mongodb://localhost/lounge';

// Use connect method to connect to the Server
const connect = () => {
  mongoose.connect(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  })
    .then(() => console.log("Connected successfully to database server"))
    .catch(err => console.log("Error connecting to database server", err));
}

module.exports = {
  connect,
};
