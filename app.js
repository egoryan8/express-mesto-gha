const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const userRouter = require('./routes/userRouter');
const cardRouter = require('./routes/cardRouter');
const auth = require('./middlewares/auth');
const error = require('./middlewares/error');
const { loginValidation, registerValidation } = require('./utils/validation/user');
const { login, createUser } = require('./controllers/user');
const NotFoundError = require('./utils/errorClasses/NotFoundError');

const { PORT = 3000 } = process.env;

const app = express();
app.use(bodyParser.json());
mongoose.connect('mongodb://localhost:27017/mestodb');

app.post('/signin', loginValidation, login);
app.post('/signup', registerValidation, createUser);

app.use(auth);

app.use('/users', userRouter);
app.use('/cards', cardRouter);
app.use('*', () => {
  throw new NotFoundError('Ничего не найдено. Проверьте URL и метод запроса');
});

app.use(errors());
app.use(error);

app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});
