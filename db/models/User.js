const mongoose = require('mongoose');

const { ObjectId, Schema, model } = mongoose;

const userSchema = new Schema({
  spotifyId: String,
  lounges: [new Schema({
    _id: ObjectId,
    name: String,
    code: String,
  })],
});

const User = model('User', userSchema, 'users');

module.exports = User;
