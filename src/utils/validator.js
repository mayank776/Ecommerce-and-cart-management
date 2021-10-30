const mongoose = require("mongoose");

const { systemConfig } = require("../configs");

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const phoneRegex = /^[6-9][0-9]{9}$/;

const imageRegex = /.*\.(jpeg|jpg|png)$/;

const pincodeRegex = /^[1-9][0-9]{5}$/;

const validEmail = function (email) {
  return emailRegex.test(email);
};

const validPhone = function (phone) {
  return phoneRegex.test(phone);
};

const validPassword = function (password) {
  return password.length >= 8 && password.length <= 15;
};

const validPincode = function (pincode) {
  return pincodeRegex.test(pincode);
};

const isValid = function (value) {
  if (typeof value === "object" && value.length === 0) return false;
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  if (typeof value === "number" && value.toString().trim().length === 0)
    return false;
  if (typeof value == "Boolean") return true;
  return true;
};

const isValidObjectId = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId);
};

const isValidRequestBody = function (requestBody) {
  return Object.keys(requestBody).length > 0;
};

const validFile = function (files) {
  // didnt write files** .originalName
  return imageRegex.test(files.originalname);
};

const isValidSize = function (size) {
  return systemConfig.sizeEnumArray.indexOf(size) !== -1;
};

const isValidStatus = function (status) {
  return systemConfig.OrderStatusEnumArray.indexOf(status) !== -1;
};

module.exports = {
  validEmail,
  validPhone,
  validPassword,
  validPincode,
  isValid,
  isValidRequestBody,
  isValidObjectId,
  validFile,
  isValidSize,
  isValidStatus,
};
