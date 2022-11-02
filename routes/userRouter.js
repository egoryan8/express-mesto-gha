const userRouter = require('express').Router();
const {
  getUsers,
  getUser,
  updateUser,
  updateAvatar,
  getMe,
} = require('../controllers/user');

const { userIdValidation, userVAlidation, avatarValidation } = require('../utils/validation/user');

userRouter.get('/', getUsers);
userRouter.get('/:id', userIdValidation, getUser);
userRouter.get('/me', getMe);
userRouter.patch('/me', userVAlidation, updateUser);
userRouter.patch('/me/avatar', avatarValidation, updateAvatar);

module.exports = userRouter;
