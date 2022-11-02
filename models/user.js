const mongoose = require('mongoose');
const validator = require('validator');
const { Schema } = require('mongoose');
const bcrypt = require('bcrypt');

const AuthorizedError = require('../utils/errorClasses/AuthorizedError');

const userSchema = new Schema({
  name: {
    type: String,
    default: 'Жак-Ив Кусто',
    minlength: 2,
    maxlength: 30,
  },
  about: {
    type: String,
    default: 'Исследователь',
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator: (value) => validator.isURL(value, { protocols: ['http', 'https'], require_protocol: true }),
      message: ({ value }) => `${value} - некоректный адрес URL. Ожидается адрес в формате: http(s)://(www).site.com`,
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => validator.isEmail(v),
      message: () => 'Введен некорректный email',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

// eslint-disable-next-line func-names, consistent-return
userSchema.statics.isAuthorize = async function (email, password) {
  try {
    const user = await this.findOne({ email }).select('+password');
    if (!user) {
      return Promise.reject(new AuthorizedError('Неверный email или пароль'));
    }
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return Promise.reject(new AuthorizedError('Неверный email или пароль'));
    }

    if (user && match) {
      return user;
    }
  } catch (e) {
    console.log(e);
  }
};

module.exports = mongoose.model('user', userSchema);
