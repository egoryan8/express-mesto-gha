require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// const cors = require('cors');
const { errors } = require('celebrate');
const userRouter = require('./routes/userRouter');
const cardRouter = require('./routes/cardRouter');
const auth = require('./middlewares/auth');
const error = require('./middlewares/error');
const { loginValidation, registerValidation } = require('./utils/validation/user');
const { login, createUser } = require('./controllers/user');
const NotFoundError = require('./utils/errorClasses/NotFoundError');
const { errorLogger, requestLogger } = require('./middlewares/logger');
const cors = require('./middlewares/cors');

const { PORT = 3000 } = process.env;

const app = express();
app.use(requestLogger);
app.use(cors);
app.use(bodyParser.json());
mongoose.connect('mongodb://localhost:27017/mestodb');
app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});
app.post('/signin', loginValidation, login);
app.post('/signup', registerValidation, createUser);

app.use(auth);
app.use('/cards', cardRouter);
app.use('/users', userRouter);
app.use('*', () => {
  throw new NotFoundError('Запрашиваемый адрес не найден. Проверьте URL и метод запроса');
});
app.use(errorLogger);
app.use(errors());
app.use(error);

app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});
