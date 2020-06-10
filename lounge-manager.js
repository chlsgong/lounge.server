const _ = require('lodash');

// Holds all the active lounges
let lounges = {};

// Add a lounge
const add = (id, token) => {
  lounges[id] = { token };
};

// Retrieve a lounge
const get = (id) => _.get(lounges, id);

// Persist a lounge

module.exports = {
  add,
  get,
};
