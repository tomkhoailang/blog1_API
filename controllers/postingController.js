const Posting = require('../models/postingModel');
const AppError = require('../utils/AppError');
const factory = require('./handlerFactory');
const handleUpload = require('../utils/handleUpload');
const catchAsync = require('../utils/catchAsync');
const filterObj = require('../utils/getFilteredObj');

const modifyAuthors = (authors, currentUserId) => {
  const ownPostingUserId = { authorId: currentUserId, type: 'writer' };
  if (!authors) {
    return next(new AppError('A posting must have an author or more', 401));
  }
  const customAuthors = authors.map((el) => {
    if (el.type) {
      return next(
        new AppError('You don not have a right to modify author', 401)
      );
    } else {
      if (el.name) {
        el.type = 'outsider';
      } else if (el.authorId) {
        el.type = 'coAuthor';
      }
    }
    return el;
  });
  customAuthors.unshift(ownPostingUserId);
  return customAuthors;
};
const createPostingMiddleware = catchAsync(async (req, res, next) => {
  req.body = await handleUpload.handleUploadImage(req, res, next, 'posts');
  if (req.user.role === 'manager') {
    req.body.status = 'active';
  } else {
    req.body.status = 'pending';
  }
  req.body.authors = modifyAuthors(req.body.authors, req.user.id);
  next();
});
const handleUpdatePosting = catchAsync(async (req, res, next) => {
  req.body = await handleUpload.handleUploadImage(req, res, next, 'posts');
  const filteredObj = filterObj(
    req.body,
    /title|content|coverImage|postImage|authors/
  );
  req.body = filteredObj;
  req.body.authors = modifyAuthors(req.body.authors, req.user.id);
  next();
});
const createPosting = factory.createOne(Posting);
const getAllPosting = factory.getAll(Posting);
const getPosting = factory.getOne(Posting);
const deletePosting = factory.deleteOne(Posting);
const updatePosting = factory.updateOne(Posting);

module.exports = {
  createPosting,
  getPosting,
  getAllPosting,
  deletePosting,
  updatePosting,
  createPostingMiddleware,
  handleUpdatePosting,
};
