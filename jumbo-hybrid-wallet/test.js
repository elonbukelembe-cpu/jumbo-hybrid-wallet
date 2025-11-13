if (process.env.CI) {
  console.log("Skipping DB tests in CI environment");
  process.exit(0);
}

// quick local test - run with `node test.js` after installing dependencies and setting MONGO_URI in env
const mongoose = require('mongoose');
const wallet = require('./index');

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jumbo-test';

async function run() {
  await mongoose.connect(MONGO);
  console.log('Connected to MongoDB', MONGO);

  const ownerId = new mongoose.Types.ObjectId();
  console.log('ownerId:', ownerId.toString());

  const w1 = await wallet.depositCredits(ownerId, 'payg', 1000, 'Initial top-up');
  console.log('after deposit balance:', w1.balance);

  await wallet.spendCredits(ownerId, 'payg', 200, 'Buy item');
  const bal = await wallet.checkBalance(ownerId, 'payg');
  console.log('final balance:', bal);

  const summary = await wallet.getWalletSummary(ownerId);
  console.log('summary:', JSON.stringify(summary, null, 2));
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
