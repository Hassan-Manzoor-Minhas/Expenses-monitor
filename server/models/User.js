import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    currency: {
      type: String,
      default: 'USD',
      enum: [
        'USD',
        'EUR',
        'GBP',
        'PKR',
        'INR',
        'AED',
        'SAR',
        'CAD',
        'AUD',
        'JPY',
        'CNY',
        'CHF',
        'SGD',
        'NZD',
        'BDT',
        'TRY',
        'BRL',
        'ZAR',
      ],
    },
    budgetLimit: {
      type: Number,
      default: 2500,
    },
    categoryBudgets: {
      type: Map,
      of: Number,
      default: {
        'Food & Dining': 500,
        'Housing & Rent': 1000,
        'Transportation': 250,
        'Utilities': 200,
        'Entertainment': 150,
        'Shopping': 200,
        'Healthcare': 100,
        'Other': 100,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving in Mongoose
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password helper
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
