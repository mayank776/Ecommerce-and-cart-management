const mongoose = require("mongoose");

const { systemConfig } = require("../configs");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: "enter the title",
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: "enter the description",
      trim: true,
    },
    price: { type: Number, required: "enter the price", trim: true },
    currencyId: { type: String, required: "enter the currencyId", trim: true },
    currencyFormat: {
      type: String,
      required: "enter the currencyFormat",
      trim: true,
    },
    isFreeShipping: { type: Boolean, default: false, trim: true },
    productImage: { type: String, required: "add an image link", trim: true }, // s3 link
    style: { type: String, trim: true },
    availableSizes: [
      {
        type: String,
        enum: systemConfig.sizeEnumArray,
        trim: true,
      },
    ],
    installments: { type: Number, trim: true },
    deletedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
