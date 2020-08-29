const mongoose = require('mongoose');
const _ = require('lodash');
const Lounge = require('./models/Lounge');

// const { Types } = mongoose;

// const getUser = spotifyId => User.findOne({ spotifyId });

const createLounge = ({ hostId, name, code, refreshToken }) => {
  const lounge = new Lounge({
    hostId,
    name,
    code,
    auth: {
      refreshToken
    },
  });

  return lounge.save();
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
  createLounge,
};
