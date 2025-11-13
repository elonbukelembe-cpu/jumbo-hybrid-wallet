const { Wallet, Transaction } = require('./models');
const mongoose = require('mongoose');

// Notification hook for balance updates
let notifyBalanceUpdate = async () => {};
function setBalanceUpdateNotifier(callback) {
  if (typeof callback === 'function') notifyBalanceUpdate = callback;
}

// Helper: validate walletType
function _validateWalletType(walletType) {
  const allowed = ['subscription', 'payg', 'bonus', 'escrow'];
  if (!allowed.includes(walletType)) throw new Error(`Invalid walletType. Allowed: ${allowed.join(', ')}`);
}

// Create or get wallet
async function _getOrCreateWallet(ownerId, walletType, defaults = {}) {
  if (!ownerId) throw new Error('ownerId is required');
  _validateWalletType(walletType);

  let wallet = await Wallet.findOne({ ownerId, type: walletType });
  if (!wallet) {
    wallet = new Wallet(Object.assign({
      ownerId,
      type: walletType,
      balance: 0,
      currency: 'KES',
      creditRate: 1
    }, defaults));
    await wallet.save();
  }
  return wallet;
}

// Deposit
async function depositCredits(ownerId, walletType, amount, description='Deposit', category='general', metadata={}) {
  if (amount <= 0) throw new Error('Deposit amount must be > 0');
  const wallet = await _getOrCreateWallet(ownerId, walletType);

  wallet.balance += amount;
  const transaction = new Transaction({ walletId: wallet._id, type: 'credit', amount, description, category, metadata });
  wallet.transactions.push(transaction._id);

  await Promise.all([wallet.save(), transaction.save()]);
  await notifyBalanceUpdate(wallet);
  return wallet;
}

// Spend/withdraw
async function spendCredits(ownerId, walletType, amount, description='Purchase', category='general', metadata={}) {
  if (amount <= 0) throw new Error('Spend amount must be > 0');
  const wallet = await Wallet.findOne({ ownerId, type: walletType });
  if (!wallet) throw new Error('Wallet not found');
  if (wallet.balance < amount) throw new Error('Insufficient balance');

  wallet.balance -= amount;
  const transaction = new Transaction({ walletId: wallet._id, type: 'debit', amount, description, category, metadata });
  wallet.transactions.push(transaction._id);

  await Promise.all([wallet.save(), transaction.save()]);
  await notifyBalanceUpdate(wallet);
  return wallet;
}

// Payout (similar to spend but marked as payout)
async function payout(ownerId, walletType, amount, description='Payout', category='general', metadata={}) {
  if (amount <= 0) throw new Error('Payout amount must be > 0');
  const wallet = await Wallet.findOne({ ownerId, type: walletType });
  if (!wallet) throw new Error('Wallet not found');
  if (wallet.balance < amount) throw new Error('Insufficient balance');

  wallet.balance -= amount;
  const transaction = new Transaction({ walletId: wallet._id, type: 'payout', amount, description, category, metadata });
  wallet.transactions.push(transaction._id);

  await Promise.all([wallet.save(), transaction.save()]);
  await notifyBalanceUpdate(wallet);
  return wallet;
}

// Check balance
async function checkBalance(ownerId, walletType) {
  const wallet = await Wallet.findOne({ ownerId, type: walletType });
  return wallet ? wallet.balance : 0;
}

// Credits to currency conversion
async function creditsToCurrency(ownerId, walletType, credits) {
  const wallet = await Wallet.findOne({ ownerId, type: walletType });
  if (!wallet) throw new Error('Wallet not found');
  return credits * wallet.creditRate;
}

// Get wallet summary with totals
async function getWalletSummary(ownerId) {
  const wallets = await Wallet.find({ ownerId }).populate('transactions');
  return wallets.map(w => {
    const totalCreditsEarned = (w.transactions || []).filter(t => t.type === 'credit').reduce((a,b)=>a+b.amount,0);
    const totalSpent = (w.transactions || []).filter(t => t.type === 'debit').reduce((a,b)=>a+b.amount,0);
    const totalPayouts = (w.transactions || []).filter(t => t.type === 'payout').reduce((a,b)=>a+b.amount,0);
    return {
      walletId: w._id,
      type: w.type,
      balance: w.balance,
      currency: w.currency,
      creditRate: w.creditRate,
      totalCreditsEarned,
      totalSpent,
      totalPayouts,
      transactionCount: (w.transactions || []).length
    };
  });
}

module.exports = {
  depositCredits,
  spendCredits,
  payout,
  checkBalance,
  creditsToCurrency,
  getWalletSummary,
  setBalanceUpdateNotifier
};
