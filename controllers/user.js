const User = require('../models/user');
const {
  NOT_FOUND_ERROR_CODE,
  DEFAULT_ERROR_CODE,
  INCORRECT_DATA_ERROR_CODE,
} = require('../utils/errorCodes');

module.exports.getUsers = async (req, res) => {
  try {
    const user = await User.find({});
    res.send(user);
  } catch (err) {
    res.status(DEFAULT_ERROR_CODE).json({
      message: 'Не удалось получить пользователей',
    });
  }
};

module.exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(NOT_FOUND_ERROR_CODE).json({
        message: 'Пользователь не найден',
      });
    }

    res.send(user);
  } catch (err) {
    if (err.name === 'CastError') {
      res.status(INCORRECT_DATA_ERROR_CODE).json({
        message: 'Переданы не валидные данные',
      });
    } else {
      res.status(DEFAULT_ERROR_CODE).json({
        message: 'Не удалось найти пользователя',
      });
    }
  }
  return 0;
};

module.exports.createUser = async (req, res) => {
  try {
    const { name, about, avatar } = req.body;
    const user = await User.create({ name, about, avatar });
    res.send(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(INCORRECT_DATA_ERROR_CODE).json({
        message: 'Переданы не валидные данные',
      });
    } else {
      res.status(DEFAULT_ERROR_CODE).json({
        message: 'Не удалось создать пользователя',
      });
    }
  }
};

module.exports.updateUser = async (req, res) => {
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
  } catch (e) {
    if (e.name === 'ValidationError') {
      res.status(INCORRECT_DATA_ERROR_CODE).json({
        message: 'Переданы не валидные данные',
      });
    } else {
      res.status(DEFAULT_ERROR_CODE).json({
        message: 'Не удалось обновить данные',
      });
    }
  }
};

module.exports.updateAvatar = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true,
    });
    res.send(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(INCORRECT_DATA_ERROR_CODE).json({
        message: 'Переданы не валидные данные',
      });
    } else {
      res.status(DEFAULT_ERROR_CODE).json({
        message: 'Не удалось обновить пользователя',
      });
    }
  }
};
