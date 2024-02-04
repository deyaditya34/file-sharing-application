const { scryptSync } = require("crypto");

const config = require("../config");
const jwtService = require("../service/jwt.service");
const database = require("../service/database.service");

function buildUser(username, password) {
  return {
    username: username,
    password: encryptPassword(password),
    role: "user",
  };
}

function buildAdminUser(username, password) {
  return {
    username: username,
    password: encryptPassword(password),
    role: "admin"
  }
}

function encryptPassword(password) {
  return scryptSync(password, config.ENCRYPTED_PASSWORD_SALT, 64).toString(
    "hex"
  );
}

async function getUserFromToken(token, role) {
  const payload = jwtService.decodeToken(token);
  if (!payload) {
    return null;
  }

  const username = payload.username;

  const user = await database
    .getCollection(config.COLLECTION_NAME_USERS)
    .findOne(
      { username: username, role: role },
      { projection: { _id: false, password: false, role: false } }
    );

  return user;
}

module.exports = {
  buildUser,
  buildAdminUser,
  getUserFromToken,
};
