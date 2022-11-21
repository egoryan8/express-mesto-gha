const Card = require('../models/card');

const BadRequestError = require('../utils/errorClasses/BadRequestError');
const ForbiddenError = require('../utils/errorClasses/ForbiddenError');
const NotFoundError = require('../utils/errorClasses/NotFoundError');

const USER_REF = [
  { path: 'likes', model: 'user' },
  { path: 'owner', model: 'user' },
];

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
    await Card.findByIdAndRemove(req.params.cardId);
    res.send({ message: 'Карточка удалена' });
  } catch (err) {
    if (err.name === 'CastError') {
      next(new BadRequestError('Некорректный формат id карточки'));
    } else {
      next(err);
    }
  }
};

const handleCardLike = async (req, res, next, options) => {
  try {
    const action = options.addLike ? '$addToSet' : '$pull';

    const updatedCard = await Card.findByIdAndUpdate(
      req.params.cardId,
      { [action]: { likes: req.user._id } },
      { new: true },
    ).populate(USER_REF);

    if (!updatedCard) {
      throw new NotFoundError('Карточка не найдена');
    }

    res.send({
      updatedCard,
    });
  } catch (e) {
    if (e.name === 'CastError') {
      next(new BadRequestError('Переданы невалидные данные'));
    } else {
      next(e);
    }
  }
};

module.exports.putLike = (req, res, next) => {
  handleCardLike(req, res, next, { addLike: true });
};

module.exports.deleteLike = (req, res, next) => {
  handleCardLike(req, res, next, { addLike: false });
};
