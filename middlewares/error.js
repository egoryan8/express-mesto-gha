module.exports = (error, req, res, next) => {
  const { statusCode = 500, message } = error;

  res.status(statusCode).send({
    message: statusCode === 500 ? 'Возникла проблема с сервером, повторите запрос позже' : message,
  });
  next();
};
