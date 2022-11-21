const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const BadRequestError = require('../utils/errorClasses/BadRequestError');
const NotFoundError = require('../utils/errorClasses/NotFoundError');
const ConflictError = require('../utils/errorClasses/ConflictError');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    next(err);
  }
};

// eslint-disable-next-line consistent-return
module.exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
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
  try {
    const {
      name, about, avatar, email, password,
    } = req.body;
    const hash = await bcrypt.hash(password, 10);
    // eslint-disable-next-line no-unused-vars
    const user = await User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    });
    res.send({
      message: 'Пользователь успешно создан',
    });
  } catch (e) {
    if (e.code === 11000) {
      next(new ConflictError('Пользователь с данным email уже зарегистрирован'));
    } else if (e.name === 'CastError') {
      next(new BadRequestError('Переданы не валидные данные'));
    } else {
      next(e);
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
    const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
    res.send({ token });
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new BadRequestError('Переданы невалидные данные'));
    } else {
      next(err);
    }
  }
};

// eslint-disable-next-line consistent-return
module.exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    res.send(user);
  } catch (e) {
    return next(e);
  }
};
