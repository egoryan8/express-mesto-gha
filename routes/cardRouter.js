const cardRouter = require('express').Router();
const {
  getCards,
  createCard,
  deleteCard,
  putLike,
  deleteLike,
} = require('../controllers/card');

const { cardIdValidation, cardValidation } = require('../utils/validation/card');

cardRouter.get('/', getCards);
cardRouter.post('/', cardValidation, createCard);
cardRouter.delete('/:cardId', cardIdValidation, deleteCard);
cardRouter.put('/:cardId/likes', cardIdValidation, putLike);
cardRouter.delete('/:cardId/likes', cardIdValidation, deleteLike);

module.exports = cardRouter;
