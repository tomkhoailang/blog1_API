const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
  createAt: {
    type: Date,
    required: [true, 'A comment must have a date'],
    default: Date.now(),
  },
  modifyAt: {
    type: Date,
  },
  comment: {
    type: String,
    required: [true, 'The user must provide a comment'],
    minLength: [10, 'A comment must be more than or equal to 10 characters'],
  },
  posting: {
    type: mongoose.Schema.ObjectId,
    ref: 'Posting',
    required: [true, 'A comment must belong to a posting'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A comment must belong to a user'],
  },
});
const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
