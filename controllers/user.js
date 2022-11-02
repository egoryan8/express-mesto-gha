const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const BadRequestError = require('../utils/errorClasses/BadRequestError');
const NotFoundError = require('../utils/errorClasses/NotFoundError');
const ConflictError = require('../utils/errorClasses/ConflictError');

const { JWT_SECRET } = require('../utils/constants');

module.exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    next(err);
  }
};

module.exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      next(new NotFoundError('Пользователь не найден'));
    }

    res.send(user);
  } catch (err) {
    if (err.name === 'CastError') {
      next(new BadRequestError('Переданы невалидные данные'));
    } else {
      next(err);
    }
  }
};

module.exports.createUser = async (req, res, next) => {
  const {
    email,
    password,
    name,
    about,
    avatar,
  } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    });
    res.send(user);
  } catch (err) {
    if (err.code === 11000) {
      next(new ConflictError('Пользователь с таким email уже существует'));
    } else if (err.name === 'ValidationError') {
      next(new BadRequestError(err.message));
    } else {
      next(err);
    }
  }
};

module.exports.updateUser = async (req, res, next) => {
  try {
    const { name, about } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, about },
      {
        new: true,
        runValidators: true,
      },
    );
    res.send(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new BadRequestError('Переданы невалидные данные'));
    } else {
      next(err);
    }
  }
};

module.exports.updateAvatar = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true,
    });
    res.send(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new BadRequestError('Переданы невалидные данные'));
    } else {
      next(err);
    }
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.handleUnAuthorizedUser(email, password);
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
      maxAge: 3600 * 24 * 7,
      httpOnly: true,
      sameSite: true,
    }).send({ email });
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new BadRequestError('Переданы невалидные данные'));
    } else {
      next(err);
    }
  }
};

module.exports.getMe = (req, res, next) => {
  User.findOne({ _id: req.user._id })
    .then((user) => res.send(user))
    .catch(next);
};
