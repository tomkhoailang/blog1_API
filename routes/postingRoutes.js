const express = require('express');
const postingController = require('../controllers/postingController');
const authController = require('../controllers/authController');
const commentRouter = require('../routes/commentRoutes');

const router = express.Router({ mergeParams: true });

router.use('/:postingId/reviews', commentRouter);

router
  .route('/')
  .post(
    authController.protect,
    postingController.createPostingMiddleware,
    postingController.createPosting
  )
  .get(postingController.getAllPosting);

router
  .route('/:id')
  .get(postingController.getPosting)
  .delete(
    authController.protect,
    authController.checkPostAuthorizationDelete,
    postingController.deletePosting
  )
  .patch(
    authController.protect,
    authController.checkPostAuthorizationUpdate,
    postingController.handleUpdatePosting,
    postingController.updatePosting
  );

module.exports = router;
