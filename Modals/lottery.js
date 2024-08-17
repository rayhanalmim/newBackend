"use strict";

const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    lotteryId: {
      type: String,
      required: true,
    },
    lotteryType: {
      type: String
    },
    holders:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TicketHolders",
      }
    ],
    holdersBuy: {
      type: Map
    },
    maxTicket: {
      type: Number
    },
    ticketSold: {
      type: Number
    },
    taxCollected: {
      type: Number,
      default: 0
    },
    treasuryTax:{
        type: Number,
        default: 0
    },
    totalTax: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
    },
    topPrize:[ {
      type: Number,
    }],
    prizeDistribution : [
      {
        type: Number
      }
    ],
    totalPrize: {
      type: Number
    },
    winners:[
      {
        type: String
      }
    ],
    drawn: {
      type: Boolean
    },
    generalPrize : [{
      type: Number
    }],
    purchases: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Purchase",
      },
    ],
  },
  {
    timestamp: true,
  }
);

module.exports = new mongoose.model("Game", schema);
