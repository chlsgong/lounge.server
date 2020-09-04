const mongoose = require('mongoose');

const { ObjectId, Schema, model } = mongoose;

const activeLoungeSchema = new Schema({
  loungeId: ObjectId,
  code: String,
});

// Parameters include: name of model, schema, collection
const ActiveLounge = model('ActiveLounge', activeLoungeSchema, 'activeLounges');

module.exports = ActiveLounge;
