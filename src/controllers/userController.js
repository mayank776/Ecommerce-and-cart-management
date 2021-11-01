const { userModel } = require("../models");

const { validator, aws, jwt } = require("../utils");

const bcrypt = require("bcrypt");

const registerUser = async (req, res) => {
  try {
    const requestBody = req.body;
    // QUESTION -- HOW TO SEND REQUEST BODY SEPARATELY
    const files = req.files;

    // VALID REQUEST BODY

    if (!validator.isValid(requestBody)) {
      res
        .status(400)
        .send({ status: false, message: "Invalid request , Body is required" });
      return;
    }

    if (!validator.isValidRequestBody(JSON.parse(requestBody))) {
      res
        .status(400)
        .send({ status: false, msg: "please enter the user details" });
      return;
    }

    // VALID FILES
    if (!validator.isValid(files)) {
      res
        .status(400)
        .send({ status: false, msg: "please insert the file-data" });
      return;
    }

    if (!validator.validFile(files[0])) {
      res
        .status(400)
        .send({ status: false, msg: "please insert an image in files" });
      return;
    }

    //  OBJECT DESTRUCTURING
    let { fname, lname, email, phone, password} = requestBody;
    let address = JSON.parse(requestBody.address)

    // VALIDATING EACH REQUIREMENT
    // NAME
    if (!validator.isValid(fname)) {
      res
        .status(400)
        .send({ status: false, msg: "please enter the first name" });
      return;
    }

    if (!validator.isValid(lname)) {
      res
        .status(400)
        .send({ status: false, msg: "please enter the last name" });
      return;
    }

    // EMAIL
    if (!validator.isValid(email)) {
      res.status(400).send({ status: false, msg: "please enter an email" });
      return;
    }

    if (!validator.validEmail(email)) {
      res
        .status(400)
        .send({ status: false, msg: "please enter the valid email" });
      return;
    }

    let isEmailAlreadyUsed = await userModel.findOne({ email });

    if (isEmailAlreadyUsed) {
      res
        .status(400)
        .send({ status: false, msg: `this ${email} is already registered` });
      return;
    }

    // PHONE
    if (!validator.isValid(phone)) {
      res
        .status(400)
        .send({ status: false, msg: "please enter the phone no." });
      return;
    }

    if (!validator.validPhone(phone)) {
      res
        .status(400)
        .send({ status: false, msg: "please enter the valid phone no." });
      return;
    }

    let isPhoneAlreadyUsed = await userModel.findOne({ phone });

    if (isPhoneAlreadyUsed) {
      res
        .status(400)
        .send({ status: false, msg: `this ${phone} is already registered` });
      return;
    }

    // PASSWORD
    if (!validator.isValid(password)) {
      res.status(400).send({ status: false, msg: "please enter the password" });
      return;
    }

    if (!validator.validPassword(password)) {
      res
        .status(400)
        .send({ status: false, msg: "please enter the valid password" });
      return;
    }

    // ENCRYPTING PASSWORD
    let saltRounds = 10;
    let salt = await bcrypt.genSalt(saltRounds);
    let hash = await bcrypt.hash(password, salt);

    password = hash;

    // ADDRESS
    if (!validator.isValid(address)) {
      res.status(400).send({ status: false, msg: "please provide a address" });
      return;
    }

    if (!validator.isValid(address.shipping)) {
      res
        .status(400)
        .send({ status: false, msg: "please provide a shipping address" });
      return;
    }

    if (!validator.isValid(address.billing)) {
      res
        .status(400)
        .send({ status: false, msg: "please provide a billing address" });
      return;
    }

    if (!validator.isValid(address.shipping.street)) {
      res
        .status(400)
        .send({ status: false, msg: "please provide a shipping street" });
      return;
    }

    if (!validator.isValid(address.shipping.city)) {
      res
        .status(400)
        .send({ status: false, msg: "please provide a shipping city" });
      return;
    }

    if (!validator.isValid(address.shipping.pincode)) {
      res
        .status(400)
        .send({ status: false, msg: "please provide a shipping pincode" });
      return;
    }
    if (!validator.validPincode(address.shipping.pincode)) {
      res
        .status(400)
        .send({ status: false, msg: "Please provide valid shipping pincode" });
      return;
    }

    if (!validator.isValid(address.billing.street)) {
      res
        .status(400)
        .send({ status: false, msg: "please provide a billing street" });
      return;
    }

    if (!validator.isValid(address.billing.city)) {
      res
        .status(400)
        .send({ status: false, msg: "please provide a billing city" });
      return;
    }

    if (!validator.isValid(address.billing.pincode)) {
      res
        .status(400)
        .send({ status: false, msg: "please provide a billing pincode" });
      return;
    }
    if (!validator.validPincode(address.billing.pincode)) {
      res
        .status(400)
        .send({ status: false, msg: "Please provide valid billing pincode" });
      return;
    }

    // UPLOADING THE FILE
    let profileImage = await aws.uploadFile(files[0]);

    if (!profileImage) {
      res
        .status(400)
        .send({ status: false, msg: "error in uloading the files" });
      return;
    }

    // GETTING ALL THE VALUES
    const newUser = {
      fname,
      lname,
      email,
      profileImage,
      phone,
      password,
      address,
    };

    // CREATING USER
    createdUser = await userModel.create(newUser);

    res.status(201).send({
      status: true,
      msg: "user successfully created",
      data: createdUser,
    });
  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const requestBody = req.body;

    // VVALIDATING REQUEST BODY
    if (!validator.isValidRequestBody(requestBody)) {
      res
        .status(400)
        .send({ sttaus: false, msg: "please enter the request body" });
      return;
    }

    const { email, password } = requestBody;

    // VALIDATION FOR ID AND PASSWORD
    if (!validator.isValid(email)) {
      res.status(400).send({ status: false, msg: "please enter an email" });
      return;
    }

    if (!validator.validEmail(email)) {
      res
        .status(400)
        .send({ status: false, msg: "please enter the valid email" });
      return;
    }

    if (!validator.isValid(password)) {
      res.status(400).send({ status: false, msg: "please enter the password" });
      return;
    }

    if (!validator.validPassword(password)) {
      res
        .status(400)
        .send({ status: false, msg: "please enter the valid password" });
      return;
    }

    // FINDING USER
    let user = await userModel.findOne({ email });

    if (!user) {
      res
        .status(404)
        .send({ status: false, msg: `user not found having this ${email} id` });
      return;
    }

    // DECRYPTING PASSWORD
    let validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      res
        .status(403)
        .send({ status: false, msg: "user credentials does not match" });
      return;
    }

    // CREATING TOKEN
    const token = await jwt.createToken({ userId: user._id });

    res.header("Authorization", token);
    res
      .status(200)
      .send({ status: true, message: `successful login`, data: { token } });
  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};

const getProfileById = async (req, res) => {
  try {
    // TAKING VALUE FROM PARAMS
    const userId = req.params.userId;
    const userIdFromToken = req.userId;

    // VALIDATING BOTH ID'S
    if (!validator.isValidObjectId(userId)) {
      res.status(400).send({ status: false, message: "userId not valid" });
      return;
    }

    if (!validator.isValidObjectId(userIdFromToken)) {
      res.status(400).send({ status: false, message: "userTokenId not valid" });
      return;
    }

    // AUTHORISING
    if (userId !== userIdFromToken) {
      res.status(401).send({ status: false, message: "unauthorised access" });
      return;
    }

    // FINDING USER
    let user = await userModel.findOne({ _id: userId });
    if (!user) {
      res.status(404).send({ status: false, message: "user not found" });
      return;
    }

    res.status(200).send({ status: true, message: "success", data: user });
  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};

const updateProfileById = async (req, res) => {
  try {
    // TAKING VALUES FROM REQUEST
    const requestBody = req.body;
    const userId = req.params.userId;
    const userIdFromToken = req.userId;

    // VALIDATING BOTH ID'S
    // const userIdFromToken = req.userId
    let files = req.files

    if(!validator.isValidObjectId(userId)){
        return res.status(404).send({status:false, msg:'user not found'})
    }
    let user = await userModel.findById(userId)
    if(!user){
        return res.status(404).send({status:false, msg:'user not registered'})
    }


    // if(!validator.isValidObjectId(userIdFromToken)) {
    //     res.status(400).send({status: false, message: `${userIdFromToken} is not a valid token id`})
    //     return
    // }

   
    // if(!validator.isValidRequestBody(requestBody) || !validator.) {
    //     res.status(200).send({status: true, message: 'No paramateres passed. user unmodified', data: user})
    //     return
    // }

    // Extract params
    let {lname, fname, phone, email, password, address} = requestBody;

    let updatedUserData = {}

    if(validator.isValid(lname)) {
        if(!Object.prototype.hasOwnProperty.call(updatedUserData, '$set')) updatedUserData['$set'] = {}

        updatedUserData['$set']['lname'] = lname
    }

    if(validator.isValid(fname)) {
        if(!Object.prototype.hasOwnProperty.call(updatedUserData, '$set')) updatedUserData['$set'] = {}

        updatedUserData['$set']['fname'] = fname
    }

    if(validator.isValid(phone)) {
        if(!Object.prototype.hasOwnProperty.call(updatedUserData, '$set')) updatedUserData['$set'] = {}

        updatedUserData['$set']['phone'] = phone
    }
    if(validator.isValid(email)) {
        if(!Object.prototype.hasOwnProperty.call(updatedUserData, '$set')) updatedUserData['$set'] = {}

        updatedUserData['$set']['email'] = email
    }
    // password

    if(validator.isValid(password)) {

        if(!validator.isValidPassword(password)) {
            return res.status(400).send({status:false, msg:'Password is not valid'})
        }

        let saltRounds = 10
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(password, salt);

        password = hash

        if(!Object.prototype.hasOwnProperty.call(updatedUserData, '$set')) updatedUserData['$set'] = {}

        updatedUserData['$set']['password'] = password
    }





    //address
    if(validator.isValid(address)) {
        if(!Object.prototype.hasOwnProperty.call(updatedUserData, '$set')) updatedUserData['$set'] = {}

        updatedUserData['$set']['address'] = address
    }

    // image

    

    if(validator.isValid(files)){
        const fileData = files[0]
        var profileImage = await aws.uploadFile(fileData)
    }

    if(validator.isValid(profileImage)) {
        if(!Object.prototype.hasOwnProperty.call(updatedUserData, '$set')) updatedUserData['$set'] = {}

        updatedUserData['$set']['profileImage'] = profileImage
    }
    
    const upadateduser = await userModel.findOneAndUpdate({_id: userId}, updatedUserData, {new: true})

    res.status(200).send({status: true, message: 'Success', data: upadateduser});
    

  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfileById,
  updateProfileById,
};
