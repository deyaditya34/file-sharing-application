const database = require("../service/database.service");
const config = require("../config");

async function insertFile(fileDetails) {
  return database.getCollection(config.MYFILES).insertOne(fileDetails);
}

async function checkFileName(fileName, user) {
  return database.getCollection(config.MYFILES).findOne({ fileName: fileName, user });
}

async function renameFileName(id, updatedFileName, user) {
  return database
    .getCollection(config.MYFILES)
    .updateOne({ fileId: id, user }, { $set: { fileName: updatedFileName } });
}

async function getFile(id, user) {
  return database.getCollection(config.MYFILES).findOne({ fileId: id, user });
}

async function searchFile(filter, user) {
  return database.getCollection(config.MYFILES).find(filter, user).toArray();
}

module.exports = {
  insertFile,
  checkFileName,
  renameFileName,
  getFile,
  searchFile
};
