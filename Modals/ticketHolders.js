'use strict'

const mongoose = require('mongoose');

const schema = mongoose.Schema(
    {
        address: {
            type: String,
            required: true
        },
        totalBuy: {
            type: Number
        },
        participate:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lottery",
          }],
        lotteryBuy: {
           easy: {
                type: Number
            },
            superX: {
                type: Number
            }
        },
        premium: {
            type: Boolean
        },
        firstLavelRafferal:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "TicketHolders",
            }
        ]
    },
    {
        timestamp: true
    }
);

module.exports = new mongoose.model('TicketHolders', schema);