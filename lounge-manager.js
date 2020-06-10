const _ = require('lodash');

// Holds all the active lounges
let lounges = {};

// NOTE: This is for convenience for development here.
// TODO: Put the code in the same table as lounges.
// Holds all the active lounge codes
let loungeCodes = {};

// Add a lounge
const add = (id, code, token) => {
  lounges[id] = { token };
  loungeCodes[code] = { id };
};

// Retrieve a lounge
const getLounge = (id) => _.get(lounges, id);

// Retrieve a loungeId
const getLoungeId = (code) => _.get(loungeCodes, code);

// Persist a lounge

module.exports = {
  add,
  getLounge,
  getLoungeId,
};
