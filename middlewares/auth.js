const jwt = require('jsonwebtoken');
const AuthorizedError = require('../utils/errorClasses/AuthorizedError');

const { NODE_ENV, JWT_SECRET } = process.env;

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  let payload;
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return next(new AuthorizedError('Нужно авторизоваться!'));
    }
    payload = jwt.verify(
      token,
      NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
    );
  } catch (e) {
    return next(new AuthorizedError('Нужно авторизоваться!'));
  }
  req.user = payload;
  next();
};
