const path = require('path');
const multer = require('multer');
const AppError = require('../utils/AppError');

const storage = (uploadPath) =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(path.join(`${__dirname}/../`, uploadPath)));
    },
    filename: function (req, file, cb) {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1000);
      cb(null, unique + '-' + file.originalname);
    },
  });
const uploadImage = (options) => {
  let currentStorage;
  if (options === 'posts') currentStorage = storage('public/img/posts');
  else if (options === 'users') currentStorage = storage('public/img/users');

  return multer({
    storage: currentStorage,
    limits: {
      fileSize: 1500000,
    },
    fileFilter: async (req, file, cb) => {
      const filetypes = /jpeg|jpg|png|gif/;
      const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
      );
      if (extname) {
        return cb(null, true);
      } else {
        cb('Only .png .jpg .jpeg are allowed', false);
      }
    },
  }).fields([
    {
      name: 'coverImage',
      maxCount: 1,
    },
    {
      name: 'postImage',
    },
    {
      name: 'userAvatar',
    },
  ]);
};
const handleUploadImage = (req, res, next, options) => {
  return new Promise((resolve, reject) => {
    uploadImage(options)(req, res, (err) => {
      if (err) {
        return next(new AppError(`Error uploading file: ${err}`, 400));
      }
      let data = {};
      if (options === 'users')
        if (req.files['userAvatar'] && req.files['userAvatar'].length > 0) {
          data.photo = req.files['userAvatar'][0].filename;
        }
      if (options === 'posts') {
        data = JSON.parse(req.body.data);
        if (req.files['coverImage'] && req.files['coverImage'].length > 0) {
          data.coverImage = req.files['coverImage'][0].filename;
        }
        if (req.files['postImage'] && req.files['postImage'].length > 0) {
          data.postImage = req.files['postImage']
            .reduce((acc, file) => acc + ' ' + file.filename, '')
            .trim();
        }
      }
      resolve(data);
    });
  });
};
module.exports = {
  handleUploadImage,
};
