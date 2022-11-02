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

userSchema.statics.handleUnAuthorizedUser = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new AuthorizedError('Неверный email или пароль'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new AuthorizedError('Неверный email или пароль'));
          }
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
