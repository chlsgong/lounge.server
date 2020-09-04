const mongoose = require('mongoose');
const _ = require('lodash');
const User = require('./models/User');
const { ObjectId } = require('mongodb');

// const { Types } = mongoose;

const getUserById = id => User.findById(id);
const getUserBySpotifyId = spotifyId => User.findOne({ spotifyId });

const createUser = spotifyId => {
  const user = new User({
    spotifyId,
    activeLoungeId: null,
    lounges: [],
  });

  return user.save();
};

const updateUserLounges = ({ userId, lounge }) => {
  return User.findOneAndUpdate(
    { _id: userId },
    { $push: { lounges: lounge }},
  );
};

const updateUserActiveLounge = ({ userId, activeLoungeId }) => {
  return User.findOneAndUpdate(
    { _id: userId },
    { activeLoungeId },
  );
};

// const saveUser = user => {
//   const user = new User({
//     spotifyId: '0',
//     lounges: [{
//       _id: new Types.ObjectId('100000000000000000000001'),
//       name: 'Test lounge name',
//       code: 'TEST01',
//     }],
//   });

//   user.save()
//     .then(user => console.log('User saved', user))
//     .catch(err => console.log('Error:', err));
// }

module.exports = {
  getUserById,
  getUserBySpotifyId,
  createUser,
  updateUserLounges,
  updateUserActiveLounge,
};
