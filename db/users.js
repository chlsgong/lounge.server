const mongoose = require('mongoose');
const _ = require('lodash');
const User = require('./models/User');

// const { Types } = mongoose;

const getUser = spotifyId => User.findOne({ spotifyId });

const createUser = spotifyId => {
  const user = new User({
    spotifyId,
    lounges: [],
  });

  return user.save();
}

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
  getUser,
  createUser
};
