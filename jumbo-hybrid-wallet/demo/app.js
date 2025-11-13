const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const walletRoutes = require("../routes");

require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use("/api", walletRoutes);

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/jumbo_wallet";

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => res.send("Jumbo Wallet Demo API Running"));

app.listen(PORT, () => console.log(`Demo API listening on port ${PORT}`));
