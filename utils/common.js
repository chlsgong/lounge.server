const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
};

const createCode = (length) => {
  const baseChars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';

  let baseString = '';
  for (let i = 0; i < length; i++) {
    baseString += baseChars.charAt(getRandomInt(baseChars.length));
  }

  return baseString;
};

module.exports = {
  getRandomInt,
  createCode,
};
