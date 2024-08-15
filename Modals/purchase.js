'use strict'

const mongoose = require('mongoose');

const schema = mongoose.Schema(
    {
        buyer: {
            type: String,
            required: true
        },
        LotteryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lottery',
            required: true
        },
        amount: {
            type : Number,
            required: true
        },
        purchaseBy: {
            type: String,
        },
        price: {
            type: Number
        },
    },
    {
        timestamp: true
    }
);

module.exports = new mongoose.model('Purchase', schema);