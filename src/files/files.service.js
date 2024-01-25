const database = require("../service/database.service");
const config = require("../config");

async function insertFile(fileDetails) {
  return database.getCollection(config.MYFILES).insertOne(fileDetails);
}

async function checkFileName(fileName) {
  return database.getCollection(config.MYFILES).findOne({ fileName: fileName });
}

async function renameFileName(id, updatedFileName) {
  return database
    .getCollection(config.MYFILES)
    .updateOne({ fileId: id }, { $set: { fileName: updatedFileName } });
}

async function getFile(id) {
  return database.getCollection(config.MYFILES).findOne({ fileId: id });
}

async function searchFile(filter) {
  return database.getCollection(config.MYFILES).find(filter).toArray();
}

module.exports = {
  insertFile,
  checkFileName,
  renameFileName,
  getFile,
  searchFile
};
