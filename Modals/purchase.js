"use strict";

const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    buyer: {
      type: String,
      required: true,
    },
    LotteryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lottery",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    purchaseBy: {
      type: String,
    },
    randomNumbers: {
      type: Array,
    },
    price: {
      type: Number,
    },
    purchaseTime: {
      type: Date,
      default: () =>
        new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }),
    },
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model("Purchase", schema);
