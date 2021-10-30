const mongoose = require("mongoose");

const { validator } = require("../utils");

const userSchema = new mongoose.Schema(
  {
    fname: { type: String, required: "first name is required", trim: true },
    lname: { type: String, required: "last name is required", trim: true },
    email: {
      type: String,
      required: "Email is required",
      unique: true,
      trim: true,
      vaildate: {
        validator: validator.validEmail,
        message: " please enter a valid email ",
        isAsync: true,
      },
    },
    profileImage: { type: String, required: "please upload a profile image" }, // s3 link
    phone: {
      type: Number,
      required: "please upload a phone number",
      unique: true,
      trim: true,
      validate: {
        validator: validator.validPhone,
        message: " please enter a valid phone ",
        isAsync: true,
      },
    },
    password: {
      type: String,
      required: "please enter a password",
      trim: true,
      // minLength: 8,
      // maxLength: 15,
      // why why why why wwhyw why whyw hwy why????
    },
    address: {
      shipping: {
        street: { type: String, required: "please enter a street", trim: true },
        city: { type: String, required: "please enter a city", trim: true },
        pincode: {
          type: Number,
          required: "please enter a pincode",
          trim: true,
        },
      },
      billing: {
        street: { type: String, required: "please enter a street", trim: true },
        city: { type: String, required: "please enter a city", trim: true },
        pincode: {
          type: Number,
          required: "please enter a pincode",
          trim: true,
        },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema, "users");
