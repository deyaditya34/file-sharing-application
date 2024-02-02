const database = require("../service/database.service");
const config = require("../config");

async function insertFile(fileDetails) {
  return database.getCollection(config.MYFILES).insertOne(fileDetails);
}

async function doesFilenameExistsForUser(fileName, username) {
  let existingFile = await database
    .getCollection(config.MYFILES)
    .findOne({ fileName: fileName }, { "user.username": username });

  if (existingFile) {
    return true;
  }

  return false;
}

async function doesFileIdExistsForUser(fileId, username) {
  let existingFile = await database
    .getCollection(config.MYFILES)
    .findOne({ fileId: fileId }, { "user.username": username });

  if (existingFile) {
    return true;
  }

  return false;
}

async function renameFile(id, username, updatedFileName) {
  return database
    .getCollection(config.MYFILES)
    .updateOne(
      { fileId: id, user: username },
      { $set: { fileName: updatedFileName } }
    );
}

async function getFile(id, username) {
  return database
    .getCollection(config.MYFILES)
    .findOne(
      { fileId: id },
      { $or: [{ "user.username": username }, { sharedWith: username }] }
    );
}

async function searchFile(filter, username) {
  return database
    .getCollection(config.MYFILES)
    .find(filter, {
      $or: [{ "user.username": username }, { sharedWith: username }],
    })
    .toArray();
}

async function shareFile(id, username) {
  return database
    .getCollection(config.MYFILES)
    .updateOne({ fileId: id }, { $push: { sharedWith: username } });
}

async function deleteFile(id, username, timeStamp) {
  return database
    .getCollection(config.MYFILES)
    .updateOne(
      { fileId: id, user: username },
      { $set: { deletedAt: timeStamp } }
    );
}

module.exports = {
  insertFile,
  doesFilenameExistsForUser,
  doesFileIdExistsForUser,
  renameFile,
  getFile,
  searchFile,
  shareFile,
  deleteFile,
};
