# Jumbo Hybrid Wallet

[![npm version](https://badge.fury.io/js/jumbo-hybrid-wallet.svg)](https://badge.fury.io/js/jumbo-hybrid-wallet)
[![Build Status](https://github.com/elonbukelembe-cpu/jumbo-hybrid-wallet/actions/workflows/ci.yml/badge.svg)](https://github.com/elonbukelembe-cpu/jumbo-hybrid-wallet/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Jumbo Hybrid Wallet — an extensible Node.js/MongoDB hybrid wallet module supporting:
- subscription & pay-as-you-go wallets
- multi-currency & credit conversion
- transactions with categories and metadata
- audit logs and analytics
- optional real-time balance update notifier hook

## Quick start

1. Clone the repo
2. `npm install`
3. Start a MongoDB instance and set `MONGO_URI` environment variable (or use default `mongodb://127.0.0.1:27017/jumbo-test`)
4. `node test.js` to run the smoke test

## Usage in your project

```js
const express = require('express');
const mongoose = require('mongoose');
const jumbo = require('jumbo-hybrid-wallet'); // when installed as package

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jumbo-test');

app.use('/api', jumbo.routes);

// Real-time notifier example (Socket.io)
const io = require('socket.io')(3001);
jumbo.setBalanceUpdateNotifier((w) => io.emit(`wallet-update-${w.ownerId}`, { type: w.type, balance: w.balance }));

app.listen(3000, () => console.log('Server ready on 3000'));
