const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: false},
    delivery: {type: mongoose.Schema.Types.ObjectId, ref: "DeliveryZone", required: false},
    payment: {type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: false},
    items: [{
        product: {type: String, required: true},
        bundle: {type: String, required: true},
        name: {type: String, required: true},
        quantity: {type: Number, required: true},
        unit: {type: String, required: true},
        price: {type: Number, required: true},
        total: {type: Number, required: true},
    }],
    deliveryPrice: {type: Number, required: false},
    deliveryAddress: {type: String, required: false},
    date: {type: Date, default: Date.now, required: true},
    fulfilled: {type: Boolean, default: false, required: true},
    grandTotal: {type: Number, default: 0, required: true},
    cut: {type: Boolean, default: false, required: true},
    instruction: {type: String, required: false},
    discount: {type: Number, default: 0, required: true},
    status: {type: String, default: 'Pending', enum: ['Pending', 'Cancelled', 'Pending-Payment', 'Paid', 'Fulfilled'], required: true}
});

module.exports = mongoose.model("OrderV2", OrderSchema);
