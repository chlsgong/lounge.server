const mongoose = require('mongoose');

const { ObjectId, Schema, model } = mongoose;

const userSchema = new Schema({
  spotifyId: String,
  activeLoungeId: ObjectId,
  lounges: [new Schema({
    _id: ObjectId,
    name: String,
    code: String,
  })],
});

// Parameters include: name of model, schema, collection
const User = model('User', userSchema, 'users');

module.exports = User;
