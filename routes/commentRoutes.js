const express = require('express');
const commentController = require('../controllers/commentController');
const authController = require('../controllers/authController');
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(
    authController.protect,
    commentController.handleCreateComment,
    commentController.createComment
  )
  .get(commentController.getAllComment);
router
  .route('/:id')
  .get(commentController.getComment)
  .delete(
    authController.protect,
    authController.checkCommentAuthorizationDelete,
    commentController.deleteComment
  )
  .patch(
    authController.protect,
    authController.checkCommentAuthorizationUpdate,
    commentController.handleUpdateComment,
    commentController.updateComment
  );

module.exports = router;
