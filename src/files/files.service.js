const database = require("../service/database.service");
const config = require("../config");

async function insertFile(fileDetails) {
  return database.getCollection(config.MYFILES).insertOne(fileDetails);
}

async function checkFileName(fileName, user) {
  return database
    .getCollection(config.MYFILES)
    .findOne({ fileName: fileName, user });
}

async function renameFileName(id, updatedFileName, user) {
  return database
    .getCollection(config.MYFILES)
    .updateOne({ fileId: id, user }, { $set: { fileName: updatedFileName } });
}

async function getFile(id, username) {
  return database
    .getCollection(config.MYFILES)
    .findOne(
      { fileId: id },
      { $or: [{ "user.username": username }, { sharedWith: "username" }] }
    );
}

async function searchFile(filter, username) {
  return database
    .getCollection(config.MYFILES)
    .find(filter, {
      $or: [{ "user.username": username }, { sharedWith: "username" }],
    })
    .toArray();
}

async function shareFile(id, username) {
  return database
    .getCollection(config.MYFILES)
    .updateOne({ fileId: id }, { $push: { sharedWith: username } });
}

module.exports = {
  insertFile,
  checkFileName,
  renameFileName,
  getFile,
  searchFile,
  shareFile,
};
