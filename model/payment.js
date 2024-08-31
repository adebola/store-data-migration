const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    date: {type: Date, default: Date.now, required: true},
    amount: {type: Number, required: true},
    status: {type: String, default: 'Pending', enum: ['Pending', 'Paid'], required: true},
    authorization_url: {type: String, required: false},
    access_code: {type: String, required: false},
    reference: {type: String, required: false},
    paymentId: {type: String, required: false},
    user: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: false},
});

module.exports = mongoose.model("Payment", PaymentSchema);
