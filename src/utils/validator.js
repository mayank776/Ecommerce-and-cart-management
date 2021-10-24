const mongoose = require('mongoose')

const {systemConfig} = require('../configs')

const reemail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const rephone = /^[6-9][0-9]{9}$/;

const reimage = /.*\.(jpeg|jpg|png)$/

// mobile
const validatePhone = function (phone) {
    return rephone.test(phone);
};

// email
const validateEmail = function (email) {
    return reemail.test(email)
};

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}


//password
const PasswordLength = function (password) {
    if (password.length >= 8 && password.length <= 15) return true
    return false;
}

//request Body
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

// file
const isValidFiles = function (requestFiles) {
    return requestFiles.length > 0
}

// image 
const isValidImage = function (image) {
    return reimage.test(image.originalname)
}

//objectId
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

//String
const isValidString = function (value) {
    return Object.prototype.toString.call(value) === "[object String]"
}

//Number
const isValidNumber = function (value) {
    if (typeof value === "number" && value.toString().trim().length === 0) return false;
    return true;
}

//Array
const isValidArray = function(array) {
    return Object.keys(array).length > 0
}

//date
const isValidDate = function (value) {
    return Object.prototype.toString.call(value) === "[object Date]"
}

//price
const isValidPrice = function (price) {
    return price > 0
}

//currencyId 
const isValidCurrencyId = function (currencyId) {
    return currencyId == "INR"
}

//currencyFormat 
// const isValidCurrencyFormat = function (currencyFormat) {
//     return currencyFormat == "₹"
// }

//shipping
const isValidFreeShipping = function (value) {
    return value === true || value === false
}

//isValidInstallment
const isValidInstallment = function(installments){
    return ((typeof installments == "number") && (installments % 1 === 0) && (installments > 0))
}

//availablesizes
const isValidSize = function(size) {
    let result = true;
    for(let i=0; i<size.length; i++){   
        if(systemConfig.sizeEnumArray.indexOf(size[i]) === -1) result = false
    }
    return result
}


module.exports = {
    validateEmail,
    emailRegex: reemail,
    isValid,
    isValidRequestBody,
    isValidObjectId,
    isValidString,
    isValidArray,
    PasswordLength,
    isValidDate,
    isValidNumber,
    isValidFiles,
    validatePhone,
    phoneRegex: rephone,
    isValidImage,
    imageRegex: reimage,
    isValidPrice,
    isValidCurrencyId,
    isValidFreeShipping,
    isValidSize,
    isValidInstallment
};