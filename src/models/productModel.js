const mongoose = require('mongoose')

let productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: 'title is required',
        unique: true
    },
    description: {
        type: String,
        required: 'description is required',
    },
    price: {
        type: Number,
        required: 'price is required'
    },
    currencyId: {
        type: String,
        required: 'currencyId is required',
    },
    currencyFormat: {
        type: String,
        required: 'currencyFormat is required'
    },
    isFreeShipping: {
        type: Boolean,
        default: false
    },
    productImage: {
        type: String,
        required: 'productImage is required'
    },  // s3 link
    style: {
        type: String
    },
    availableSizes: {
        type: [String],
        enum: ["S", "XS", "M", "X", "L", "XXL", "XL"]
    },
    installments: {
        type: Number
    },
    deletedAt: {
        type: Date
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, { timestamps: true })

module.exports = mongoose.model("Product", productSchema)