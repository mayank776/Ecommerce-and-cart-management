const mongoose = require("mongoose");

const { systemConfig } = require("../configs");

const objectId = mongoose.Types.ObjectId;

const orderSchema = new mongoose.Schema({
  userId: {
    type: objectId,
    refs: "User",
    required: "enter the userId",
    unique: true,
  },
  items: [
    {
      productId: { type: objectId, refs: "Product", required: true },
      quantity: {
        type: Number,
        required: "enter the total number of products",
        minLen: 1,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: "enter the total amount of all items in cart",
  },
  totalItems: { type: Number, required: "enter the total no. of items" },
  totalQuantity: {
    type: number,
    required: "enter the total quantity of all items",
  },
  cancellable: { type: Boolean, default: true },
  status: {
    type: String,
    default: "pending",
    enum: systemConfig.OrderStatusEnumArray,
  },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
});

module.exports = mongoose.model("Order", orderSchema);
