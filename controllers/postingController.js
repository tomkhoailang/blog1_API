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
  req.body.updateDate = Date.now();
  next();
});
const activeOnePosting = catchAsync(async (req, res, next) => {
  let currentPosting = await Posting.findByIdAndUpdate(
    req.params.id,
    {
      status: 'active',
    },
    { new: true }
  );
  console.log(currentPosting);
  if (!currentPosting) {
    return next(new AppError('Cannot find posting with the current id', 404));
  }
  res.status(201).json({
    status: 'success',
    message: 'The posting is active',
    posting: currentPosting,
  });
});
const activeAllPosting = catchAsync(async (req, res, next) => {
  let newActivePosting = await Posting.updateMany(
    { status: 'pending' },
    { status: 'active' }
  );
  if (!newActivePosting) {
    return next(new AppError('There is no pending postings', 404));
  }
  res.status(201).json({
    status: 'success',
    message: 'All postings is active',
  });
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
  activeOnePosting,
  createPostingMiddleware,
  handleUpdatePosting,
  activeAllPosting,
};
