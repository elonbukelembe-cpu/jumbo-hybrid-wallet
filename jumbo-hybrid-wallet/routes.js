const express = require('express');
const router = express.Router();
const walletService = require('./walletService');

// POST /api/wallet/deposit
router.post('/wallet/deposit', async (req, res) => {
  try {
    const { ownerId, walletType, amount, description, category, metadata } = req.body;
    const wallet = await walletService.depositCredits(ownerId, walletType, Number(amount), description, category, metadata);
    res.json(wallet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/wallet/spend
router.post('/wallet/spend', async (req, res) => {
  try {
    const { ownerId, walletType, amount, description, category, metadata } = req.body;
    const wallet = await walletService.spendCredits(ownerId, walletType, Number(amount), description, category, metadata);
    res.json(wallet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/wallet/payout
router.post('/wallet/payout', async (req, res) => {
  try {
    const { ownerId, walletType, amount, description, category, metadata } = req.body;
    const wallet = await walletService.payout(ownerId, walletType, Number(amount), description, category, metadata);
    res.json(wallet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/wallet/:ownerId/:walletType
router.get('/wallet/:ownerId/:walletType', async (req, res) => {
  try {
    const { ownerId, walletType } = req.params;
    const balance = await walletService.checkBalance(ownerId, walletType);
    res.json({ ownerId, walletType, balance });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
