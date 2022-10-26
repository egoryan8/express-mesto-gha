const User = require('../models/user');

module.exports.getUsers = async (req, res) => {
  try {
    const user = await User.find({});
    res.send(user);
  } catch (err) {
    res.status(500).json({
      message: 'Не удалось получить пользователей',
    });
  }
};

module.exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден',
      });
    }

    res.send(user);
  } catch (err) {
    if (err.name === 'CastError') {
      res.status(400).json({
        message: 'Переданы не валидные данные',
      });
      return 0;
    }
    res.status(500).json({
      message: 'Не удалось найти пользователя',
    });
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
      res.status(400).json({
        message: 'Переданы не валидные данные',
      });
      return;
    }
    res.status(500).json({
      message: 'Не удалось создать пользователя',
    });
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
      res.status(400).json({
        message: 'Переданы не валидные данные',
      });
      return;
    }
    res.status(500).json({
      message: 'Не удалось обновить данные',
    });
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
      res.status(400).json({
        message: 'Переданы не валидные данные',
      });
      return;
    }
    res.status(500).json({
      message: 'Не удалось обновить пользователя',
    });
  }
};
