const ActiveLounge = require('./models/ActiveLounge');

const createActiveLounge = ({ loungeId, code }) => {
  const activeLounge = new ActiveLounge({
    loungeId,
    code,
  });

  return activeLounge.save();
};

const deleteActiveLounge = loungeId => {
  return ActiveLounge.deleteOne({ loungeId });
};

const getActiveLoungeByCode = code => ActiveLounge.findOne({ code });

module.exports = {
  createActiveLounge,
  deleteActiveLounge,
  getActiveLoungeByCode,
};
