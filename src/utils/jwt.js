const {systemConfig } = require("../configs");

const jwt = require("jsonwebtoken");

const createToken = async function ({userId}) {
  try {
    const token = await jwt.sign(
      {
        userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + systemConfig.jwtExpiry,
      },
      systemConfig.jwtSecretKey
    );
    return token;
  } catch (error) {
    console.error(`Error! creating jwt token ${error.message}`);
    throw error;
  }
};

const verifyToken = async (token) => {
  // i used req, res as well with token and it broke the code 
  try {
    const decoded = await jwt.verify(token, systemConfig.jwtSecretKey);
    return decoded;
  } catch (error) {
    console.error(`Error! verifying jwt token ${error.message}`);
  }
};

module.exports = {
  createToken,
  verifyToken,
};
