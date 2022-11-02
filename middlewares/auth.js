const jwt = require('jsonwebtoken');
const AuthorizedError = require('../utils/errorClasses/AuthorizedError');

const { JWT_SECRET } = require('../utils/constants');

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    throw new AuthorizedError('Нужно авторизоваться');
  }
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new AuthorizedError('Нужно авторизоваться');
  }
  req.user = payload;
  next();
};
