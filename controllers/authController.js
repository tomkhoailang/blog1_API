const User = require('../models/userModel');
const Posting = require('../models/postingModel');
const Comment = require('../models/commentModel');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const validator = require('validator');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.MY_VERY_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, res) => {
  user.password = undefined;
  let token = signToken(user.id);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
const signup = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);
  createSendToken(user, 201, res);
});
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please enter email and password'));
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.checkPassword(password))) {
    return next(new AppError('Incorrect email or password'), 401);
  }
  createSendToken(user, 201, res);
});
const protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('You are not logged in!'), 401);
  }
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.MY_VERY_SECRET_KEY
  );
  const user = await User.findById(decoded.id);
  if (!user || user.isPasswordChangedBefore(decoded.iat)) {
    return next(
      new AppError('The token belongs to the user is not valid'),
      401
    );
  }
  req.user = user;
  next();
});
const forgotPassword = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  if (!email || !validator.isEmail(email)) {
    return next(new AppError('Please enter a valid email address'), 400);
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('Can not find the entered email'), 400);
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://${req.host}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password?
  If not, please ignore this email, if yes, then you should copy the link below and send a PATCH request to update your password
  ${resetURL}`;
  try {
    await sendEmail({
      email,
      subject: 'Your password reset token(valid for 10 min)',
      message: message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token is sent to your email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the mail. Please try again later',
        400
      )
    );
  }
});
const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('SHA256')
    .update(req.params.resetToken)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: Date.now(),
    },
  });
  if (!user) {
    return next(new AppError('The reset token is invalid or expired!', 400));
  }
  if (req.body.password === req.body.passwordConfirm) {
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
  } else {
    return next(
      new AppError('Both password and passwordConfirm must be the same!', 400)
    );
  }
  createSendToken(user, 201, res);
});
const changePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('password');
  console.log(user);
  if (!(await user.comparePassword(req.body.currentPassword, user.password))) {
    res.status(401).json({
      status: 'fail',
      message: 'Your current password is incorrect',
    });
  }
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.confirmNewPassword;
  await user.save();
  createSendToken(user, 201, res);
});
const checkPostAuthorizationUpdate = catchAsync(async (req, res, next) => {
  const currentPost = await Posting.findById(req.params.id);
  const checkWriter = currentPost.authors.filter((el) => {
    return el.type === 'writer' && el.authorId.id === req.user.id;
  });
  if (checkWriter.length === 1) {
    next();
  } else {
    return next(new AppError('This posting is not at your own', 400));
  }
});
const checkPostAuthorizationDelete = catchAsync(async (req, res, next) => {
  const currentPost = await Posting.findById(req.params.id);
  const checkWriter = currentPost.authors.filter((el) => {
    return el.type === 'writer' && el.authorId.id === req.user.id;
  });
  if (checkWriter.length === 1 || req.user.role === 'manager') {
    next();
  } else {
    return next(new AppError('This posting is not at your own', 400));
  }
});
const checkCommentAuthorizationUpdate = catchAsync(async (req, res, next) => {
  const currentComment = await Comment.findById(req.params.id);
  const checkUser =
    req.user.id === currentComment.user.toString() ? true : false;
  if (checkUser) {
    next();
  } else {
    return next(new AppError('This is not your comment', 400));
  }
});
const checkCommentAuthorizationDelete = catchAsync(async (req, res, next) => {
  const currentComment = await Comment.findById(req.params.id);
  console.log(currentComment);
  const checkUser =
    req.user.id === currentComment.user.toString() ? true : false;
  if (checkUser || req.user.role === 'manager') {
    next();
  } else {
    return next(new AppError('This is not your comment', 400));
  }
});
module.exports = {
  signup,
  login,
  protect,
  forgotPassword,
  resetPassword,
  changePassword,
  checkPostAuthorizationUpdate,
  checkPostAuthorizationDelete,
  checkCommentAuthorizationUpdate,
  checkCommentAuthorizationDelete,
};
