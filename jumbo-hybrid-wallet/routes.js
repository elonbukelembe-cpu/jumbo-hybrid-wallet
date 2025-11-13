const express = require("express");
const router = express.Router();
const {
  depositCredits,
  spendCredits,
  payout,
  checkBalance,
  getWalletSummary,
  setBalanceUpdateNotifier
} = require("./walletService");

// Optional: WebSocket or other notifier example
setBalanceUpdateNotifier(async (wallet) => {
  console.log(`Wallet updated: ${wallet.ownerId} - ${wallet.type} balance: ${wallet.balance}`);
});

// Helper: async wrapper to catch errors
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Deposit endpoint
router.post("/wallet/deposit", asyncHandler(async (req, res) => {
  const { ownerId, walletType, amount, description, category, metadata } = req.body;
  const wallet = await depositCredits(ownerId, walletType, amount, description, category, metadata);
  res.json({ success: true, wallet });
}));

// Spend endpoint
router.post("/wallet/spend", asyncHandler(async (req, res) => {
  const { ownerId, walletType, amount, description, category, metadata } = req.body;
  const wallet = await spendCredits(ownerId, walletType, amount, description, category, metadata);
  res.json({ success: true, wallet });
}));

// Payout endpoint
router.post("/wallet/payout", asyncHandler(async (req, res) => {
  const { ownerId, walletType, amount, description, category, metadata } = req.body;
  const wallet = await payout(ownerId, walletType, amount, description, category, metadata);
  res.json({ success: true, wallet });
}));

// Check balance endpoint
router.get("/wallet/:ownerId/:walletType/balance", asyncHandler(async (req, res) => {
  const { ownerId, walletType } = req.params;
  const balance = await checkBalance(ownerId, walletType);
  res.json({ success: true, ownerId, walletType, balance });
}));

// Get full wallet summary
router.get("/wallet/:ownerId/summary", asyncHandler(async (req, res) => {
  const { ownerId } = req.params;
  const summary = await getWalletSummary(ownerId);
  res.json({ success: true, ownerId, summary });
}));

// Global error handler
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(400).json({ success: false, error: err.message });
});

module.exports = router;
