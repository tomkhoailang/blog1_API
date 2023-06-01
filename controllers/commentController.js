const catchAsync = require('../utils/catchAsync');
const Comment = require('../models/commentModel');
const factory = require('./handlerFactory');
const filterObj = require('../utils/getFilteredObj');

const handleCreateComment = (req, res, next) => {
  if (req.params.postingId) {
    req.body.posting = req.params.postingId;
  }
  req.body.user = req.user.id;
  next();
};
const handleUpdateComment = (req, res, next) => {
  const filteredObj = filterObj(req.body, /comment/);
  req.body = filteredObj;
  next();
};
const createComment = factory.createOne(Comment);
const getAllComment = factory.getAll(Comment);
const getComment = factory.getOne(Comment);
const deleteComment = factory.deleteOne(Comment);
const updateComment = factory.updateOne(Comment);
module.exports = {
  createComment,
  getAllComment,
  getComment,
  deleteComment,
  updateComment,
  handleCreateComment,
  handleUpdateComment,
};
