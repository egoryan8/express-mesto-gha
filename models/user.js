const mongoose = require('mongoose');
const validator = require('validator');
const { Schema } = require('mongoose');
const bcrypt = require('bcrypt');

const AuthorizedError = require('../utils/errorClasses/AuthorizedError');

const userSchema = new Schema({
  name: {
    type: String,
    default: 'Жак-Ив Кусто',
    minlength: [2, 'Минимальная длина поля 2 символа'],
    maxlength: [30, 'Максимальная длина поля 30 символов'],
  },
  about: {
    type: String,
    default: 'Исследователь',
    minlength: [2, 'Минимальная длина поля 2 символа'],
    maxlength: [30, 'Максимальная длина поля 30 символов'],
  },
  avatar: {
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    type: String,
    validate: {
      validator: (v) => validator.isURL(v, { protocols: ['http', 'https'], require_protocol: true }),
      message: ({ value }) => `${value} - некоректный адрес URL. Ожидается адрес в формате: http(s)://(www).site.com`,
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => validator.isEmail(v),
      message: () => 'Введен некорректный email адрес',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

// eslint-disable-next-line func-names, consistent-return
userSchema.statics.handleUnAuthorizedUser = async function (email, password) {
  try {
    const user = await this.findOne({ email }).select('+password');
    if (!user) {
      return Promise.reject(new AuthorizedError('Неверная почта или пароль'));
    }
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return Promise.reject(new AuthorizedError('Неверная почта или пароль'));
    }

    if (user && match) {
      return user;
    }
  } catch (e) {
    console.log(e);
  }
};

module.exports = mongoose.model('user', userSchema);
