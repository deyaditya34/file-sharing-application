const jwt = require("jsonwebtoken");
const config = require("../config");

function createToken(payload) {
  return jwt.sign(payload, config.JWT_SECRET_KEY);
}

function decodeToken(token) {
  try {
    return jwt.verify(token, config.JWT_SECRET_KEY);
  } catch (err) {
    console.log("Invalid Token", token);
    return null;
  }
}

module.exports = {
  createToken,
  decodeToken
}
