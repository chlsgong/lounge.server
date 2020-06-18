const mongoose = require('mongoose');
const _ = require('lodash');

const { ObjectId, Schema, Types, model } = mongoose;

const userSchema = new Schema({
  spotifyId: String,
  lounges: [new Schema({
    id: ObjectId,
    name: String,
    code: String,
  }, { _id: false })],
});

const User = model('User', userSchema, 'users');

const getUser = (id) => {
  User.findOne({ spotifyId: id })
    .then(data => console.log('User found:', _.get(data, '_id')))
    .catch(err => console.log('Error:', err));
};

const saveUser = () => {
  const user = new User({
    spotifyId: '0',
    lounges: [{
      id: new Types.ObjectId('100000000000000000000001'),
      name: 'Test lounge name',
      code: 'TEST01',
    }],
  });

  user.save()
    .then(user => console.log('User saved', user))
    .catch(err => console.log('Error:', err));
}

module.exports = {
  getUser,
  saveUser
};
