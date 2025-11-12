const mongoose = require("mongoose");
const { ORDER_STATUS } = require("../common/constant");

const orderItemsSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    purchasePrice: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
}, { _id: false });

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    orderItems: {
        type: [orderItemsSchema],
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    shippingAddress: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: Object.values(ORDER_STATUS),
        default: ORDER_STATUS.CREATED,
    },
}, { timestamps: true });

const orderModel = mongoose.model("order", orderSchema);
module.exports = orderModel;