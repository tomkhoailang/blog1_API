const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A user must have a name'],
      trim: true,
      maxLength: [
        50,
        'Name of the user should not be longer than 50 characters',
      ],
      minLength: [4, 'The user should not be less than 4 characters'],
    },
    email: {
      type: String,
      required: [true, 'A user must have a email address'],
      unique: true,
      trim: true,
      validate: [validator.isEmail, 'Please enter a valid email address'],
    },
    role: {
      type: String,
      enum: {
        values: ['manager', 'user'],
        message: '{VALUE} is not supported',
      },
      default: 'user',
    },
    photo: { type: String },
    password: {
      type: String,
      select: false,
      required: [true, 'Please enter a password'],
      minLength: [6, 'Password must be at least 6 characters'],
      maxLength: [30, 'Password must be less than or equal to 30 characters'],
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please enter a password confirmation'],
      validate: {
        //val is the entered characters of passwordConfirm
        validator: function (val) {
          return val === this.password;
        },
        message: 'Password confirmation must be as same as the one you entered',
      },
    },
    accountCreateAt: {
      type: Date,
      default: Date.now(),
    },
    passwordChangedAt: Date,
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
userSchema.virtual('posts', {
  ref: 'Comment',
  foreignField: 'user',
  localField: '_id',
});
// pre 'save' only have the next
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = Date.now() - 1000;
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre('find', function () {
  this.select('name photo email');
});
userSchema.methods.comparePassword = function (inputPassword, currentPassword) {
  return bcrypt.compare(inputPassword, currentPassword);
};
userSchema.methods.createPasswordResetToken = function () {
  // randomBytes return a buffer which includes 32 random bytes so we need to convert it to a string
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('SHA256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 1000 * 60 * 10;
  return resetToken;
};
userSchema.methods.isPasswordChangedBefore = function (JWTTimestamp) {
  const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000);
  return JWTTimestamp < changedTimestamp;
};
userSchema.methods.checkPassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};
const User = mongoose.model('User', userSchema);
module.exports = User;
