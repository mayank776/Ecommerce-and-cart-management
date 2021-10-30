const mongoose = require("mongoose");

const objectId = mongoose.Types.ObjectId;

const cartSchema = new mongoose.Schema(
  {
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
    totalPrice: { type: Number, required: "enter the total amount" },
    totalItems: { type: Number, required: "enter the total no. of products" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
