const mongoose = require('mongoose');

const { ObjectId, Schema, model } = mongoose;

const loungeSchema = new Schema({
  hostId: ObjectId,
  name: String,
  code: String,
  auth: {
    refreshToken: String
  },
});

// Parameters include: name of model, schema, collection
const Lounge = model('Lounge', loungeSchema, 'lounges');

module.exports = Lounge;
