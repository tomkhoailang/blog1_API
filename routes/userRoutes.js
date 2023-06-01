const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const postingRouter = require('../routes/postingRoutes');
const express = require('express');

const router = express.Router();

// router.use('/:userId/posts', postingRouter);

router.route('/users-stats').get(userController.getUserStats);

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:resetToken').patch(authController.resetPassword);

router
  .route('/update-profile')
  .patch(authController.protect, userController.updateProfile);
router
  .route('/delete-profile')
  .delete(authController.protect, userController.deleteProfile);
router
  .route('/change-password')
  .patch(authController.protect, authController.changePassword);
router
  .route('/update-avatar')
  .patch(authController.protect, userController.updateAvatar);

router.route('/').get(userController.getAllUser);
router.route('/:id').get(userController.getUser);
router.route('/:id/posts').get(userController.getAllPostsByAuthor);
module.exports = router;
