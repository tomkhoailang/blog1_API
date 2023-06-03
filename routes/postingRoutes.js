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
  .route('/activate')
  .post(
    authController.protect,
    authController.allowedRoles('manager'),
    postingController.activeAllPosting
  );
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
router
  .route('/:id/activate')
  .post(
    authController.protect,
    authController.allowedRoles('manager'),
    postingController.activeOnePosting
  );
module.exports = router;
