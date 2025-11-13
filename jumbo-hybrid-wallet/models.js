const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  type: { type: String, enum: ['subscription', 'payg'], required: true },
  balance: { type: Number, default: 0 },
  currency: { type: String, default: 'KES' },
  creditRate: { type: Number, default: 1 }, // 1 credit = creditRate currency units
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }]
}, { timestamps: true });

const TransactionSchema = new mongoose.Schema({
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
  type: { type: String, enum: ['credit', 'debit', 'payout'], required: true },
  amount: { type: Number, required: true },
  category: { type: String, default: 'general' },
  description: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = {
  Wallet: mongoose.model('Wallet', WalletSchema),
  Transaction: mongoose.model('Transaction', TransactionSchema)
};
