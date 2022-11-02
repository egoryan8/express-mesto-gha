const jwt = require('jsonwebtoken');
const AuthorizedError = require('../utils/errorClasses/AuthorizedError');

const { JWT_SECRET } = require('../utils/constants');

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  let payload;
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return next(new AuthorizedError('Нужно авторизоваться!'));
    }
    payload = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return next(new AuthorizedError('Нужно авторизоваться!'));
  }
  req.user = payload;
  next();
};
