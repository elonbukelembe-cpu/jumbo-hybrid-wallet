const { Wallet, Transaction } = require('./models');

let notifyBalanceUpdate = () => {};
function setBalanceUpdateNotifier(callback) {
  if (typeof callback === 'function') notifyBalanceUpdate = callback;
}

// create or find wallet helper
async function _getOrCreateWallet(ownerId, walletType, defaults = {}) {
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

async function depositCredits(ownerId, walletType, amount, description = 'Deposit', category = 'general', metadata = {}) {
  if (!ownerId) throw new Error('ownerId is required');
  if (!walletType) throw new Error('walletType is required');
  if (amount <= 0) throw new Error('amount must be > 0');

  const wallet = await _getOrCreateWallet(ownerId, walletType);
  wallet.balance += amount;

  const transaction = new Transaction({
    walletId: wallet._id,
    type: 'credit',
    amount,
    category,
    description,
    metadata
  });

  wallet.transactions.push(transaction._id);
  await transaction.save();
  await wallet.save();

  notifyBalanceUpdate(wallet);
  return wallet;
}

async function spendCredits(ownerId, walletType, amount, description = 'Purchase', category = 'general', metadata = {}) {
  if (amount <= 0) throw new Error('amount must be > 0');

  const wallet = await Wallet.findOne({ ownerId, type: walletType });
  if (!wallet || wallet.balance < amount) throw new Error('Insufficient balance');

  wallet.balance -= amount;

  const transaction = new Transaction({
    walletId: wallet._id,
    type: 'debit',
    amount,
    category,
    description,
    metadata
  });

  wallet.transactions.push(transaction._id);
  await transaction.save();
  await wallet.save();

  notifyBalanceUpdate(wallet);
  return wallet;
}

async function payout(ownerId, walletType, amount, description = 'Payout', category = 'general', metadata = {}) {
  if (amount <= 0) throw new Error('amount must be > 0');

  const wallet = await Wallet.findOne({ ownerId, type: walletType });
  if (!wallet || wallet.balance < amount) throw new Error('Insufficient balance');

  wallet.balance -= amount;

  const transaction = new Transaction({
    walletId: wallet._id,
    type: 'payout',
    amount,
    category,
    description,
    metadata
  });

  wallet.transactions.push(transaction._id);
  await transaction.save();
  await wallet.save();

  notifyBalanceUpdate(wallet);
  return wallet;
}

async function checkBalance(ownerId, walletType) {
  const wallet = await Wallet.findOne({ ownerId, type: walletType });
  return wallet ? wallet.balance : 0;
}

async function creditsToCurrency(ownerId, walletType, credits) {
  const wallet = await Wallet.findOne({ ownerId, type: walletType });
  if (!wallet) throw new Error('Wallet not found');
  return credits * wallet.creditRate;
}

async function getWalletSummary(ownerId) {
  const wallets = await Wallet.find({ ownerId }).populate('transactions');
  return wallets.map(w => {
    const totalCreditsEarned = (w.transactions || []).filter(t => t.type === 'credit').reduce((a, b) => a + b.amount, 0);
    const totalSpent = (w.transactions || []).filter(t => t.type === 'debit').reduce((a, b) => a + b.amount, 0);
    const totalPayouts = (w.transactions || []).filter(t => t.type === 'payout').reduce((a, b) => a + b.amount, 0);
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
