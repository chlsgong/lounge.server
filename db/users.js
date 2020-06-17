const mongoClient = require('./mongo-client');

const getUser = (id) => {
  mongoClient.collection('users').find({ spotifyId: id }).next()
    .then(data => {
      console.log(JSON.parse(JSON.stringify(data)));
    })
    .catch(err => {
      console.log(err);
    });
}

module.exports = {
  getUser,
};
