import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [120, 'Description cannot exceed 120 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required and must be a number'],
      min: [0.01, 'Amount must be greater than zero'],
      set: (v) => Math.round(Number(v) * 100) / 100, // Ensure numeric float with 2 decimal places
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: {
        values: ['expense', 'income'],
        message: '{VALUE} is not a valid transaction type (must be expense or income)',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
      // Stored as ISO date
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet', 'Other'],
      default: 'Debit Card',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, 'Notes cannot exceed 300 characters'],
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Ensure date is formatted as ISO string in JSON output
        if (ret.date instanceof Date) {
          ret.date = ret.date.toISOString();
        }
        return ret;
      },
    },
  }
);

// Indexes for fast lookups and month grouping queries
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1 });
transactionSchema.index({ user: 1, category: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
