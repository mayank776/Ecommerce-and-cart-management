const { validator, jwt, aws } = require("../utils");
const bcrypt = require("bcrypt");

// const { systemConfig } = require("../configs");
const { userModel } = require("../models");

const registerUser = async function (req, res) {
  try {
    if(!req.body.data){
      return res.status(400).send({status:false, msg: "please enter user detail"})
    }

    const requestBody = JSON.parse(req.body.data);
    const files = req.files;

    if (!validator.isValidRequestBody(requestBody)) {
      res.status(400).send({
        status: false,
        message: "Invalid request parameters. Please provide user details",
      });
      return;
    }

    // Extract params
    let { fname, lname, email, phone, password, address } = requestBody; // Object destructing

    // file validation
    if (!validator.isValidFiles(files)) {
      res.status(400).send({ status: false, message: "file must be sent" });
    }
    //image validation
    if (!validator.isValidImage(files[0])) {
      res
        .status(400)
        .send({ status: false, message: "file format should be image" });
    }

    // email validation
    if (!validator.isValid(email)) {
      res.status(400).send({ status: false, message: `Email is required` });
      return;
    }

    if (!validator.validateEmail(email)) {
      res.status(400).send({
        status: false,
        message: `Email should be a valid email address`,
      });
      return;
    }

    const isEmailAlreadyUsed = await userModel.findOne({ email }); // {email: email} object shorthand property

    if (isEmailAlreadyUsed) {
      res.status(400).send({
        status: false,
        message: `${email} email address is already registered`,
      });
      return;
    }

    // phone validation
    if (!validator.isValid(phone)) {
      res.status(400).send({ status: false, message: "phone is required" });
      return;
    }

    if (!validator.isValidNumber(parseInt(phone))) {
      res
        .status(400)
        .send({ status: false, message: "phone attribute should be a number" });
      return;
    }

    const isPhoneAlreadyUsed = await userModel.findOne({ phone });

    if (isPhoneAlreadyUsed) {
      res
        .status(400)
        .send({ status: false, message: `${phone} is already registered` });
      return;
    }

    // name validation
    if (!validator.isValid(fname)) {
      res.status(400).send({ status: false, message: "fname is required" });
      return;
    }

    if (!validator.isValid(lname)) {
      res.status(400).send({ status: false, message: "lname is required" });
      return;
    }

    // password validation
    if (!validator.isValid(password)) {
      res.status(400).send({ status: false, message: `Password is required` });
      return;
    }

    if (!validator.PasswordLength(password)) {
      res.status(400).send({
        status: false,
        message: `Password length should be 8 - 15 characters`,
      });
      return;
    }

    if (!validator.isValid(address)) {
      res.status(400).send({ status: false, message: "address is Required" });
      return;
    }

    if (!validator.isValid(address.shipping)) {
      res
        .status(400)
        .send({ status: false, message: "Shipping address is Required" });
      return;
    }

    if (!validator.isValid(address.billing)) {
      res
        .status(400)
        .send({ status: false, message: "Billing address is Required" });
      return;
    }

    if (!validator.isValid(address.shipping.street)) {
      res.status(400).send({
        status: false,
        message: "Shipping street address is Required",
      });
      return;
    }

    if (!validator.isValid(address.shipping.city)) {
      res
        .status(400)
        .send({ status: false, message: "Shipping city address is Required" });
      return;
    }

    if (!validator.isValid(address.shipping.pincode)) {
      res.status(400).send({
        status: false,
        message: "Shipping pincode address is Required",
      });
      return;
    }

    if (!validator.isValid(address.billing.street)) {
      res
        .status(400)
        .send({ status: false, message: "Billing street address is Required" });
      return;
    }

    if (!validator.isValid(address.billing.city)) {
      res
        .status(400)
        .send({ status: false, message: "Billing city address is Required" });
      return;
    }

    if (!validator.isValid(address.billing.pincode)) {
      res.status(400).send({
        status: false,
        message: "Billing pincode address is Required",
      });
      return;
    }
    // validation ends

    // file code
    let profileImage = await aws.uploadFile(files[0]);

    if (!profileImage) {
      res.status(400).send({ status: false, msg: "file not uploaded" });
      return;
    }

    // encryption
    let saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    let hash = bcrypt.hashSync(password, salt);
    password = hash;// bcrypt.hash() // return promise

    const userData = {
      fname,
      lname,
      email,
      profileImage,
      phone,
      password,
      address,
    };
    const newUser = await userModel.create(userData);

    res.status(201).send({ status: true, message: `Success`, data: newUser });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

// login api

const loginUser = async function (req, res) {
  try {
    const requestBody = req.body;
    if (!validator.isValidRequestBody(requestBody)) {
      res.status(400).send({
        status: false,
        message: "Invalid request parameters. Please provide login details",
      });
      return;
    }

    // Extract params
    const { email, password } = requestBody;

    // Validation starts
    if (!validator.isValid(email)) {
      res.status(400).send({ status: false, message: `Email is required` });
      return;
    }

    if (!validator.validateEmail(email)) {
      res.status(400).send({
        status: false,
        message: `Email should be a valid email address`,
      });
      return;
    }

    if (!validator.isValid(password)) {
      res.status(400).send({ status: false, message: `Password is required` });
      return;
    }
    // Validation ends

    let user = await userModel.findOne({ email });

    if (!user) {
      res
        .status(401)
        .send({ status: false, message: `Invalid login credentials` });
      return;
    }

    let hash = user.password;
    let match = await bcrypt.compare(password, hash);

    if (!match) {
      res
        .status(400)
        .send({ status: false, message: "password doesn't match" });
      return;
    }

    const token = await jwt.createToken({ userId: user._id });

    // res.header("Authorization", "Bearer " + token);
    res.status(200).send({ status: true, message: `success`, data: { token } });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

const getProfileById = async function (req, res) {
  try {
    let userId = req.params.userId;
    let userIdFromToken = req.userId;

    if (!validator.isValidObjectId(userId)) {
      res.status(400).send({ status: false, message: "userId not valid" });
      return;
    }

    if (!validator.isValidObjectId(userIdFromToken)) {
      res.status(400).send({ status: false, message: "userTokenId not valid" });
      return;
    }

    if (userId !== userIdFromToken) {
      res.status(401).send({ status: false, message: "unauthorised access" });
      return;
    }

    let user = await userModel.findOne({ _id: userId });
    if (!user) {
      res.status(404).send({ status: false, message: "user not found" });
      return;
    }

    res.status(200).send({ status: true, message: "success", data: user });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

const updateProfileById = async function (req, res) {
  try {
    const requestBody = JSON.parse(req.body.data);
    let userId = req.params.userId;
    let userIdFromToken = req.userId;
    let files = req.files;
 
    if (!validator.isValidObjectId(userId)) {
      res.status(400).send({ status: false, message: "userId not valid" });
      return;
    }

    if (!validator.isValidObjectId(userIdFromToken)) {
      res.status(400).send({ status: false, message: "userTokenId not valid" });
      return;
    }

    if (userId !== userIdFromToken) {
      res.status(401).send({ status: false, message: "unauthorised access" });
      return;
    }

    let findUser = await userModel.findOne({ _id: userId });
    if (!findUser) {
      res.status(404).send({ status: false, message: "user not found" });
      return;
    }

    if (!validator.isValidRequestBody(requestBody)) {
      res
        .status(400)
        .send({ status: false, message: "request body is not there" });
      return;
    }

    let { fname, lname, email, phone, password, address } = requestBody;

    let updateUser = {};

    if (validator.isValid(fname)) {
      if (!Object.prototype.hasOwnProperty.call(updateUser, "$set"))
        updateUser["$set"] = {};
      updateUser["$set"]["fname"] = fname;
    }

    if (validator.isValid(lname)) {
      if (!Object.prototype.hasOwnProperty.call(updateUser, "$set"))
        updateUser["$set"] = {};

      updateUser["$set"]["lname"] = lname;
    }

    if (validator.isValid(email)) {
      if (!Object.prototype.hasOwnProperty.call(updateUser, "$set"))
        updateUser["$set"] = {};

      updateUser["$set"]["email"] = email;
    }

      const isEmailAlreadyUsed = await userModel.findOne({ email });
        if (isEmailAlreadyUsed) {
            if (!(user.email == email)) {
                res.status(400).send({ status: false, message: `${email} is already used` })
                return
            }
        }

    if (validator.isValid(phone)) {
      if (!Object.prototype.hasOwnProperty.call(updateUser, "$set"))
        updateUser["$set"] = {};

      updateUser["$set"]["phone"] = phone;
    }

    const isPhoneAlreadyPresent = await userModel.findOne({ phone });
        if (isPhoneAlreadyPresent) {
            if (!(user.phone == phone)) {
                res.status(400).send({ status: false, message: `${phone} is already used` })
                return
            }
        }

    if (validator.isValid(password)) {
      if (!Object.prototype.hasOwnProperty.call(updateUser, "$set"))
        updateUser["$set"] = {};

      let saltRounds = 10;
      const salt = bcrypt.genSaltSync(saltRounds);
      let hash = bcrypt.hashSync(password, salt);
      password = hash;

      updateUser["$set"]["password"] = password;
    }

    if (validator.isValidFiles(files)) {
      if (validator.isValidImage(files[0])) {
        if (!Object.prototype.hasOwnProperty.call(updateUser, "$set"))
          updateUser["$set"] = {};

        updateUser["$set"]["files"] = await aws.uploadFile(files[0]);
      }
    }

    //address

    let userAddress = findUser.address;
    console.log(userAddress)
    // if address.street = "abc"

      if (!Object.prototype.hasOwnProperty.call(updateUser, "$set"))
        updateUser["$set"] = {};
    updateUser["$set"]["address"] = {};

      if (!Object.prototype.hasOwnProperty.call(address, "shipping")) {
         updateUser["$set"]["address"]["shipping"] = userAddress.shipping;
      } else {
         updateUser["$set"]["address"]["shipping"] = {}
      }

      if (!Object.prototype.hasOwnProperty.call(address["shipping"], "street")) {
          updateUser["$set"]["address"]["shipping"]["street"] =
          userAddress.shipping.street;
      } else {
          updateUser["$set"]["address"]["shipping"]["street"] = address.shipping.street;
      }

      if (!Object.prototype.hasOwnProperty.call(address["shipping"], "city")) {
          updateUser["$set"]["address"]["shipping"]["city"] =
          userAddress.shipping.city;
      }else {
          updateUser["$set"]["address"]["shipping"]["city"] = address.shipping.city;
      }
     

      if (!Object.prototype.hasOwnProperty.call(address["shipping"], "pincode"))
      {
          updateUser["$set"]["address"]["shipping"]["pincode"] =
          userAddress.shipping.pincode;
      }else {
         updateUser["$set"]["address"]["shipping"]["pincode"] = address.shipping.pincode;
      }
      
      
//billing
      if (!Object.prototype.hasOwnProperty.call(address, "billing")) {
          updateUser["$set"]["address"]["billing"] = userAddress.billing;
      } else {
          updateUser["$set"]["address"]["billing"] = {}
      }
      

      if (!Object.prototype.hasOwnProperty.call(address["billing"], "street")) {
          updateUser["$set"]["address"]["billing"]["street"] =
          userAddress.billing.street;
      } else {
          updateUser["$set"]["address"]["billing"]["street"] = address.billing.street;
      }


      if (!Object.prototype.hasOwnProperty.call(address["billing"], "city")) {
         updateUser["$set"]["address"]["billing"]["city"] =
          userAddress.billing.city;
      }else {
         updateUser["$set"]["address"]["billing"]["city"] = address.billing.city;
      }

      if (!Object.prototype.hasOwnProperty.call(address["billing"], "pincode"))
      {
         updateUser["$set"]["address"]["billing"]["pincode"] =
          userAddress.billing.pincode;
      }else {
        updateUser["$set"]["address"]["billing"]["pincode"] = address.billing.pincode;
      }
      

    let user = await userModel.findOneAndUpdate(
      {
        _id: userId,
      },
      updateUser,
      { new: true }
    )
    res.status(200).send({ status: true, message: "successful", data: user });
  } 
  catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
}

module.exports = {
  registerUser,
  loginUser,
  getProfileById,
  updateProfileById,
}
