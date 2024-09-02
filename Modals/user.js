const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      unique: true,
      required: true,
    },
    earnings: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    commissionEarnings: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    jackpotEarnings: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    leaderboardEarnings: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    founder: {
      type: Number,
      required: true,
      default: 0,
    },
    transactions: {
      type: Array,
      required: true,
      default: [],
    },
    availableBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    payout: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    referralId: {
      type: String,
      unique: true,
    },
    referredBy: {
      type: String,
    },
    referralLevel: {
      type: Number,
      required: true,
      default: 1,
    },
    referredBy: {
      type: String,
      default: null,
    },
    referralLink: {
      type: String,
      default: null,
    },
    referredUsers: [
      {
        user: mongoose.Schema.Types.ObjectId,
        refLevel: Number,
      },
    ],
    totalTickets: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    lastSeen: {
      type: Date,
      required: true,
      default: Date.now,
    },
    userType: {
      type: String,
      required: true,
      default: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
