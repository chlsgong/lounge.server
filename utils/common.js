const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
};

const createBase36 = (length) => {
  const base36Chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let base36String = '';
  for (let i = 0; i < length; i++) {
    base36String += base36Chars.charAt(getRandomInt(base36Chars.length));
  }

  return base36String;
};

module.exports = {
  getRandomInt,
  createBase36,
};
