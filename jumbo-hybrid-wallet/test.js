/**
 * test.js
 * Refactored to use walletService functions
 * Run with: node test.js
 */

const mongoose = require("mongoose");
const {
  depositCredits,
  spendCredits,
  payout,
  checkBalance,
  getWalletSummary,
  setBalanceUpdateNotifier
} = require("./walletService");

// Optional: balance update notification
setBalanceUpdateNotifier(async (wallet) => {
  console.log(`[NOTIFY] Wallet Updated -> Owner: ${wallet.ownerId}, Type: ${wallet.type}, Balance: ${wallet.balance}`);
});

async function runTest() {
  const MONGO_URI = "mongodb://localhost:27017/jumbo_wallet_test";

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("MongoDB connected for testing.");

    const ownerId = "user123";
    const walletType = "main";

    console.log("\n--- TEST: Deposit 1000 KES ---");
    const depositWallet = await depositCredits(ownerId, walletType, 1000, "Initial deposit", "testing");
    console.log("Deposit complete:", depositWallet);

    console.log("\n--- TEST: Spend 300 KES ---");
    const spendWallet = await spendCredits(ownerId, walletType, 300, "Test purchase", "testing");
    console.log("Spend complete:", spendWallet);

    console.log("\n--- TEST: Payout 200 KES ---");
    const payoutWallet = await payout(ownerId, walletType, 200, "Test payout", "testing");
    console.log("Payout complete:", payoutWallet);

    console.log("\n--- TEST: Check Balance ---");
    const balance = await checkBalance(ownerId, walletType);
    console.log(`Current balance for ${ownerId} (${walletType}): ${balance}`);

    console.log("\n--- TEST: Wallet Summary ---");
    const summary = await getWalletSummary(ownerId);
    console.log("Wallet Summary:", summary);

  } catch (err) {
    console.error("Test error:", err.message);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
}

// Run the test
runTest();
