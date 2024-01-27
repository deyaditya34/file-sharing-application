const httpError = require("http-errors");
const { scryptSync } = require("crypto");

const config = require("../config")
const authService = require("./auth.service");
const jwtService = require("../service/jwt.service")

async function loginUser(username, password) {
  const userDetails = buildUser(username, password);
  console.log("userdetails -", userDetails)
  
  const existingUser = await authService.findUser(userDetails);

  if (!existingUser) {
    throw new httpError.BadRequest(
      `username - '${username}' or password - '${password}' is invalid.`
    );
  }

  console.log("username -", { username });
  const token = jwtService.createToken({ username });

  return token;
}

function buildUser(username, password) {
  return {
    username: username,
    password: encryptPassword(password),
  };
}

function encryptPassword(password) {
  return scryptSync(password, config.ENCRYPTED_PASSWORD_SALT, 64).toString("hex");
}

module.exports = { loginUser };
