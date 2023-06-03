const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/AppError');

const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let currParamId = {};
    if (req.params.postingId) {
      currParamId = { posting: req.params.postingId };
    }
    if (Model.modelName.toLowerCase() === 'posting') {
      if (!req.user || req.user.role !== 'manager') {
        currParamId.status = { $ne: 'pending' };
      }
    }
    const modifiedQuery = new APIFeatures(Model.find(currParamId), req.query)
      .search()
      .filter()
      .sort()
      .paginate()
      .limit();
    const doc = await modifiedQuery.query;
    res.status(201).json({
      message: 'success',
      results: doc.length,
      data: {
        [Model.modelName.toLowerCase()]: doc,
      },
    });
  });
const getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    let doc;
    if (Model.modelName.toLowerCase() === 'posting') {
      doc = await Model.findById(req.params.id).populate('comments');
    } else if (Model.modelName.toLowerCase() === 'user') {
      doc = await Model.findById(req.params.id).populate('posts');
    } else {
      doc = await Model.findById(req.params.id);
    }
    if (!doc) {
      return next(new AppError('Can not find document with that id', 404));
    }
    res.status(201).json({
      message: 'success',
      results: doc.length,
      data: {
        [Model.modelName.toLowerCase()]: doc,
      },
    });
  });
const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('Can not find document with that id', 404));
    }
    res.status(204).json({
      message: 'success',
      data: {
        [Model.modelName.toLowerCase()]: doc,
      },
    });
  });
const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('Can not find document with that id', 404));
    }
    res.status(201).json({
      message: 'success',
      data: {
        [Model.modelName.toLowerCase()]: doc,
      },
    });
  });
const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    if (req.params.postingId) {
      req.body.posting = req.params.postingId;
    }
    const doc = await Model.create(req.body);
    res.status(201).json({
      message: 'success',
      data: {
        [Model.modelName.toLowerCase()]: doc,
      },
    });
  });
module.exports = {
  getAll,
  getOne,
  deleteOne,
  updateOne,
  createOne,
};
