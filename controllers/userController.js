const User = require('../models/userModel');
const Posting = require('../models/postingModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const filterObj = require('../utils/getFilteredObj');
const handleUpload = require('../utils/handleUpload');

const getAllUser = factory.getAll(User);
const getUser = factory.getOne(User);
const deleteProfile = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id);
  res.status(204).json({
    status: 'success',
    message: 'The account is deleted successfully!',
  });
});
const updateProfile = catchAsync(async (req, res, next) => {
  //Do not using this to update password
  let filteredObj = filterObj(req.body, /name|email/);
  const newProfile = await User.findByIdAndUpdate(req.user.id, filteredObj, {
    runValidators: true,
    new: true,
  });
  res.status(200).json({
    status: 'success',
    message: 'The profile information is changed successfully!',
    doc: newProfile,
  });
});
const updateAvatar = catchAsync(async (req, res, next) => {
  req.body = {};
  req.body = await handleUpload.handleUploadImage(req, res, next, 'users');
  let user = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
  });
  res.status(200).json({
    status: 'success',
    message: 'The avatar is uploaded successfully!',
    doc: user,
  });
});
const getAllPostsByAuthor = catchAsync(async (req, res, next) => {
  const doc = await Posting.find({ 'authors.authorId': req.params.id });
  res.status(200).json({
    message: 'success',
    data: {
      posts: doc,
    },
  });
  if (req.params.id !== req.user.id) {
    return next(new AppError('Invalid user ID. Must be your own user ID'));
  }
  req.body.role = req.user.role;
  const newProfile = await User.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });
  res.status(200).json({
    status: 'success',
    message: 'The profile information is changed successfully!',
    doc: newProfile,
  });
});
const getUserStats = catchAsync(async (req, res, next) => {
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const stats = await User.aggregate([
    {
      $match: {
        accountCreateAt: {
          $gte: currentDate,
        },
      },
    },
    {
      $group: {
        _id: 'New user',
        number: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    message: 'success',
    data: {
      stats,
    },
  });
});
module.exports = {
  getAllUser,
  getUser,
  deleteProfile,
  updateProfile,
  updateAvatar,
  getAllPostsByAuthor,
  getUserStats,
};
