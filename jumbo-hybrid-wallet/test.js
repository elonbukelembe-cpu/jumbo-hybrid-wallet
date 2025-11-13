const mongoose = require("mongoose");
const { depositCredits, spendCredits, payout, getWalletSummary } = require("./walletService");

async function runTest() {
  await mongoose.connect("mongodb://localhost:27017/jumbo_wallet_test");

  const ownerId = "user123";
  try {
    console.log("Depositing 1000 KES...");
    await depositCredits(ownerId, "main", 1000);
    console.log("Spending 200 KES...");
    await spendCredits(ownerId, "main", 200);
    console.log("Payout 100 KES...");
    await payout(ownerId, "main", 100);

    const summary = await getWalletSummary(ownerId);
    console.log("Wallet summary:", summary);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
  }
}

runTest();
