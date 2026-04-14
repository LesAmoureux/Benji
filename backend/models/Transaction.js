const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please provide a category']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: [0, 'Amount cannot be negative']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  merchantName: {
    type: String,
    trim: true
  },
  originalDescription: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  receipt: {
    url: String,
    publicId: String
  },
  accountType: {
    type: String,
    enum: ['checking', 'savings'],
    default: null
  },
  importedFrom: {
    type: String,
    enum: ['manual', 'csv', 'bank_api'],
    default: 'manual'
  },
  csvData: {
    checkNumber: String,
    transactionType: String,
    balance: Number
  },
  tags: [String],
  notes: String,
  isRecurring: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
TransactionSchema.index({ user: 1, date: -1 });
TransactionSchema.index({ user: 1, type: 1, category: 1 });
TransactionSchema.index({ user: 1, merchantName: 1 });
TransactionSchema.index({ user: 1, accountType: 1, date: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);