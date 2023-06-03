const mongoose = require('mongoose');
const postingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A posting must have a title'],
      maxLength: [200, 'The title must have less or equal than 200 characters'],
      minLength: [10, 'The title must be at least 20 characters'],
      trim: true,
    },
    //using html for rich text
    content: {
      type: String,
      required: [true, 'A posting must have a body'],
      minLength: [10, 'The body must be at least 20 characters'],
      trim: true,
    },
    coverImage: {
      type: String,
    },
    postImage: {
      type: String,
    },
    date: {
      type: Date,
      required: [true, 'A posting must have a upload date'],
      default: Date.now(),
    },
    updateDate: {
      type: Date,
      default: Date.now(),
    },
    status: {
      type: String,
      enum: ['active', 'pending'],
      required: [true, 'A posting must have a status'],
      message: '{VALUE} is not supported',
    },
    authors: [
      {
        type: {
          type: String,
          enum: ['coAuthor', 'outsider', 'writer'],
          required: true,
        },
        authorId: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
        },
        name: String,
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
postingSchema.pre(/^find/, function (next) {
  this.select('-__v');
  this.populate({
    path: 'authors.authorId',
    select: 'name photo email',
  });
  next();
});
postingSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'posting',
  localField: '_id',
});
const Posting = mongoose.model('Posting', postingSchema);
module.exports = Posting;
