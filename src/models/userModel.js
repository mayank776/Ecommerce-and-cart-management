const mongoose = require('mongoose')

const { validator } = require('../utils')

let userSchema = new mongoose.Schema({ 
    fname: {
        type: String,
        required : 'fname is required'
     },
    lname: {
        type: String,
        required: 'lname is required'
    },
    email: {
        type: String,
        required: 'lname is required',
        unique : true,
        validate: { validator: validator.validateEmail, message: 'Please fill a valid email address', isAsync: false },
        match: [validator.emailRegex, 'Please fill a valid email address']
    },
    profileImage: {
        type: String,
        required: 'profile is required'
    }, // s3 link
    phone: {
        type : Number,
        required : 'phone is required',
        unique : true
    }, 
    password: {
        type : String,
        required : 'password is required',
    }, // encrypted password
    address: {
      shipping: {
        street: {type : String, required : 'street is required'},
        city: {type : String, required : 'city is required'},
        pincode: {type : Number, required : 'pincode is required'}
      },
      billing: {
        street: {type : String, required : 'street is required'},
        city: {type : String, required : 'city is required'},
        pincode: {type : Number, required : 'pincode is required'}
      }
    },
  },{timestamps : true })

module.exports = mongoose.model('User', userSchema)