const httpError = require("http-errors")

const config = require("../config");
const authUtils = require("./auth.utils")
const database = require("../service/database.service");
const { createToken } = require("../service/jwt.service");

async function registerUser(userDetails) {
  await database
    .getCollection(config.COLLECTION_NAME_USERS)
    .insertOne(userDetails);
}

async function loginUser(username, password) {
  const userDetails = authUtils.buildUser(username, password);
  
  const existingUser = await findUser(userDetails);

  if (!existingUser) {
    throw new httpError.BadRequest(
      `username - '${username}' or password - '${password}' is invalid.`
    );
  }
  
  console.log("username -", {username})
  const token = createToken({ username });

  return token;
}

async function findUserByUsername(username) {
  return database
    .getCollection(config.COLLECTION_NAME_USERS)
    .findOne( {username} );
}

async function findUser(userDetails) {
  return database
    .getCollection(config.COLLECTION_NAME_USERS)
    .findOne(userDetails);
}

module.exports = {
  registerUser,
  loginUser,
  findUserByUsername,
  findUser,
};
