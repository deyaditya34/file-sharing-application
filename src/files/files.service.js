const database = require("../service/database.service");
const config = require("../config");
const httpError = require("http-errors");
const { ObjectId } = require("mongodb");

async function insertFile(fileDetails) {
  return database.getCollection(config.MYFILES).insertOne(fileDetails);
}

async function checkFileName(fileName) {
  return database.getCollection(config.MYFILES).findOne({ fileName: fileName });
}

async function renameFileName(id, updatedFileName) {
  return database
    .getCollection(config.MYFILES)
    .updateOne(
      { _id: new ObjectId(id) },
      { $set: { fileName: updatedFileName } }
    );
}

async function getFileName(id) {
  const file = await database
    .getCollection(config.MYFILES)
    .findOne({ _id: new ObjectId(id) });

  return file.fileName;
}

async function getFile(id) {
  return database
    .getCollection(config.MYFILES)
    .findOne({ _id: new ObjectId(id) });
}

module.exports = {
  insertFile,
  checkFileName,
  renameFileName,
  getFileName,
  getFile
};
