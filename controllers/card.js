const Card = require('../models/card');

const BadRequestError = require('../utils/errorClasses/BadRequestError');
const ForbiddenError = require('../utils/errorClasses/ForbiddenError');
const NotFoundError = require('../utils/errorClasses/NotFoundError');

module.exports.getCards = async (req, res, next) => {
  try {
    const cards = await Card.find({});
    res.send(cards);
  } catch (err) {
    next(err);
  }
};

module.exports.createCard = async (req, res, next) => {
  try {
    const { name, link } = req.body;
    const owner = req.user._id;
    const card = await Card.create({ name, link, owner });
    res.send(card);
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new BadRequestError(err.message));
    } else {
      next(err);
    }
  }
};

module.exports.deleteCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const card = await Card.findById(cardId);
    if (!card) {
      throw new NotFoundError('Пост с таким id не найден');
    }
    if (card.owner.toString() !== req.user._id) {
      throw new ForbiddenError('Нельзя удалять чужие карточки');
    }
    await Card.findByIdAndRemove(cardId);
    res.send({ message: 'Карточка удалена' });
  } catch (err) {
    if (err.name === 'CastError') {
      next(new BadRequestError('Некорректный формат id карточки'));
    } else {
      next(err);
    }
  }
};

module.exports.putLike = async (req, res, next) => {
  try {
    const response = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );
    if (!response) {
      throw new NotFoundError('Карточка с таким id не найдена');
    }
    res.send(response);
  } catch (err) {
    if (err.name === 'CastError') {
      next(new BadRequestError('Некорректный формат id карточки'));
    } else {
      next(err);
    }
  }
};

module.exports.deleteLike = async (req, res, next) => {
  try {
    const response = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    );
    if (!response) {
      throw new NotFoundError('Карточка с таким id не найдена');
    }
    res.send(response);
  } catch (err) {
    if (err.name === 'CastError') {
      next(new BadRequestError('Некорректный формат id карточки'));
    } else {
      next(err);
    }
  }
};
