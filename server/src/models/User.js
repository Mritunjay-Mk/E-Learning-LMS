import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 80
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false
    },
    role: {
      type: String,
      enum: ['student', 'educator', 'admin'],
      default: 'student'
    },
    educatorSubject: {
      type: String,
      trim: true,
      maxlength: 80,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      maxlength: 600,
      default: ''
    },
    headline: {
      type: String,
      maxlength: 120,
      default: 'Curious learner'
    },
    libraryAccess: {
      type: Boolean,
      default: false
    },
    libraryAccessPayment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLoginAt: Date
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createPasswordResetToken = function createPasswordResetToken() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

userSchema.methods.toJSON = function toJSON() {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  return user;
};

export default mongoose.model('User', userSchema);
