const Card = require('../models/card');

module.exports.getCards = async (req, res) => {
  try {
    const cards = await Card.find({});
    res.send(cards);
  } catch (error) {
    res.status(500).json({
      message: 'Не удалось получить карточки',
    });
  }
};

module.exports.createCard = async (req, res) => {
  try {
    const { name, link } = req.body;
    const owner = req.user._id;
    const card = await Card.create({ name, link, owner });
    res.send(card);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json({
        message: 'Переданы не валидные данные',
      });
      return;
    }
    res.status(500).json({
      message: 'Не удалось создать карточку',
    });
  }
};

module.exports.deleteCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const response = await Card.findByIdAndDelete(cardId);
    if (!response) {
      res
        .status(404)
        .send({ message: 'Карточки с указанным ID не существует.' });
      return;
    }
    res.send(response);
  } catch (err) {
    if (err.name === 'CastError') {
      res.status(400).send({ message: 'Карточка не найдена.' });
    }
    res.status(500).send({ message: 'Не удалось удалить карточку' });
  }
};

module.exports.putLike = async (req, res) => {
  try {
    const response = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );
    if (!response) {
      res.status(404).send({
        message: 'Карточка не найдена',
      });
      return;
    }
    res.send(response);
  } catch (err) {
    if (err.name === 'CastError') {
      res.status(400).json({
        message: 'Переданы не валидные данные',
      });
      return;
    }
    res.status(500).json({
      message: 'Не удалось изменить карточку',
    });
  }
};

module.exports.deleteLike = async (req, res) => {
  try {
    const response = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    );
    if (!response) {
      res.status(404).send({
        message: 'Переданы некорректные данные для постановки/снятии лайка.',
      });
      return;
    }
    res.send(response);
  } catch (err) {
    if (err.name === 'CastError') {
      res.status(400).json({
        message: 'Переданы не валидные данные',
      });
      return;
    }
    res.status(500).json({
      message: 'Не удалось изменить карточку',
    });
  }
};
