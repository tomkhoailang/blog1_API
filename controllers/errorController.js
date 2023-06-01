const AppError = require('../utils/AppError');

const handleValidatorErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleCastErrorDB = (err) => {
  const message = `Invalid format of params "${err.value}" to find by ${err.path}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  const errors = Object.values(err.keyValue).join(', ');
  const message = `Duplicate field ${errors}`;
  return new AppError(message, 400);
};
const handleTokenExpiredError = (err) => {
  return new AppError(err.message, 401);
};
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(err.statusCode).json({
      status: err.status,
      message: 'Something went very wrong',
    });
  }
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    //create a copy version
    let error = Object.assign(err);
    if (error.name === 'ValidationError') {
      error = handleValidatorErrorDB(error);
    }
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (error.name === 'TokenExpiredError') {
      error = handleTokenExpiredError(error);
    }
    sendErrorProd(error, res);
  }
};
