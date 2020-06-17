const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'lounge';

// Database
let db;

// Use connect method to connect to the Server
MongoClient.connect(url, { useUnifiedTopology: true })
  .then(client => {
    console.log("Connected successfully to server");

    db = client.db(dbName);
  })
  .catch(err => {
    console.log("Error connecting to server", err);
  });

  // TODO: need to check db for undefined
const collection = (name) => db.collection(name);

module.exports = {
  collection,
};
