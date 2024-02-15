const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const database = require("../service/database.service");
const { logReceiver } = require("../logs/log-events");
const config = require("../config");

const KEY_LENGTH = 24;

const IV_READ_PATH = path.join(__dirname, "iv.txt");

const KEY = crypto.scryptSync(
  config.ENCRYPTION_PASSWORD,
  config.PASSWORD_SALT,
  KEY_LENGTH
);

let iv;

try {
  let ivString = fs.readFileSync(IV_READ_PATH);

  iv = Buffer.from(JSON.parse(ivString));
} catch (err) {
  iv = crypto.randomFillSync(new Uint8Array(16));

  fs.writeFileSync(IV_READ_PATH, JSON.stringify(iv));
}

const decipher = crypto.createDecipheriv(config.ENCRYPTION_ALGORITHM, KEY, iv);

async function insertFile(fileDetails) {
  return database
    .getCollection(config.COLLECTION_NAMES_FILES)
    .insertOne(fileDetails);
}

async function doesFilenameExistsForUser(fileName, username) {
  let existingFile = await database
    .getCollection(config.COLLECTION_NAMES_FILES)
    .findOne({ fileName: fileName }, { "user.username": username });

  if (existingFile) {
    return true;
  }

  return false;
}

async function doesFileIdExistsForUser(fileId, username) {
  let existingFile = await database
    .getCollection(config.COLLECTION_NAMES_FILES)
    .findOne({ fileId, username });

  if (existingFile) {
    return true;
  }

  return false;
}

async function renameFile(fileId, username, updatedFileName) {
  return database
    .getCollection(config.COLLECTION_NAMES_FILES)
    .updateOne(
      { fileId, username, status: "active" },
      { $set: { fileName: updatedFileName, modifiedAt: new Date() } }
    );
}

async function getFile(fileId, username) {
  return database.getCollection(config.COLLECTION_NAMES_FILES).findOne(
    { fileId, status: "active" },
    {
      $or: [
        { username: username },
        {
          $and: [
            { "shares.method": "WITH_USER" },
            { "shares.target": username },
          ],
        },
      ],
    }
  );
}

async function validateToken(token) {
  return database.getCollection(config.COLLECTION_NAMES_FILES).findOne({
    $and: [
      { status: "active" },
      { $and: [{ "shares.method": "BY_LINK" }, { "shares.target": token }] },
    ],
  });
}

async function retrieveGeneratedFileLink(fileId, username) {
  const file = await database
    .getCollection(config.COLLECTION_NAMES_FILES)
    .findOne({
      fileId,
      username: username,
      status: "active",
      "shares.method": "BY_LINK",
    });

  if (!file) {
    return null;
  }

  return file["shares"][0].target;
}

async function searchFile(filter, username) {
  return database
    .getCollection(config.COLLECTION_NAMES_FILES)
    .find(filter, {
      $or: [
        { username: username },
        {
          $and: [
            { "shares.method": "WITH_USER" },
            { "shares.target": username },
          ],
        },
      ],
    })
    .toArray();
}

async function shareFileWithUser(fileId, fileShareDetails) {
  return database
    .getCollection(config.COLLECTION_NAMES_FILES)
    .updateOne(
      { fileId, status: "active" },
      { $push: { shares: { ...fileShareDetails, sharedTime: new Date() } } }
    );
}

async function changeFileStatusToDelete(fileId, username) {
  const validFile = await doesFileIdExistsForUser(fileId, username);

  if (!validFile) {
    return false;
  }

  const fileDeleted = await database
    .getCollection(config.COLLECTION_NAMES_FILES)
    .findOne({ fileId, username, deletedAt: { $exists: true } });

  if (fileDeleted) {
    return false;
  }

  return database
    .getCollection(config.COLLECTION_NAMES_FILES)
    .updateOne(
      { fileId, username },
      { $set: { deletedAt: new Date(), status: "deleted" } }
    );
}

async function storeEncryptedFile(readFilePath, writeFilePath) {
  return new Promise((resolve, reject) => {
    const cipher = crypto.createCipheriv(config.ENCRYPTION_ALGORITHM, KEY, iv);

    const fsReadStream = fs.createReadStream(readFilePath);
    const fsWriteStream = fs.createWriteStream(writeFilePath);

    fsReadStream.pipe(cipher).pipe(fsWriteStream);

    fsReadStream.on("error", (err) => {
      reject(err);
    });

    fsWriteStream.on("error", (err) => {
      reject(err);
    });

    fsWriteStream.on("finish", () => {
      resolve(`Finished writing to '${writeFilePath}'`);
    });
  });
}

async function sendDecryptedFile(
  filePath,
  fileRecord,
  fileId,
  username,
  outstream
) {
  return new Promise((resolve, reject) => {
    const fsReadStream = fs.createReadStream(filePath);

    fsReadStream.pipe(decipher).pipe(outstream);

    fsReadStream.on("error", (err) => {
      reject(`Error in streaming the file - '${fileRecord.fileName}': ${err}`);

      logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
        fileId,
        fileName: fileRecord.fileName,
        username: username,
        resMessage: `Error in streaming the file - '${fileRecord.fileName}': ${err}`,
      });
    });

    outstream.on("error", (err) => {
      reject(`Error in streaming the file - '${fileRecord.fileName}': ${err}`);
    });

    outstream.on("finish", () => {
      logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
        fileId,
        fileName: fileRecord.fileName,
        username: username,
        resMessage: `File downloaded`,
      });
      fsReadStream.close();
      resolve();
    });
  });
}

function deleteFile(filePath) {
  return fs.unlinkSync(filePath);
}

async function getFileByToken(
  token,
  readFilePath,
  outStream,
  fileId,
  fileName,
  username
) {
  return new Promise(async (resolve, reject) => {
    const fsReadStream = fs.createReadStream(readFilePath);
    console.log("readFilePath -", readFilePath);
    fsReadStream.pipe(decipher).pipe(outStream);

    fsReadStream.on("error", (err) => {
      reject(`Error in streaming the file - '${fileName}': ${err}`);

      logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
        username: username,
        token,
        fileId: fileId,
        APIError: `Error in streaming the file - '${fileName}': ${err}`,
        resMessage: "Internal Server Error",
      });
    });

    outStream.on("error", (err) => {
      reject(err);
    });

    outStream.on("finish", () => {
      logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
        username: username,
        token,
        fileId: fileId,
        resMessage: "File downloaded",
      });

      fsReadStream.close();
      resolve();
    });
  });
}

async function removeShareLinkFromFile(fileId, username) {
  return database.getCollection(config.COLLECTION_NAMES_FILES).updateOne({fileId, username: username}, {$pull : {"shares": {"method": "BY_LINK"}}})
}

module.exports = {
  insertFile,
  doesFilenameExistsForUser,
  doesFileIdExistsForUser,
  renameFile,
  getFile,
  searchFile,
  shareFileWithUser,
  changeFileStatusToDelete,
  storeEncryptedFile,
  sendDecryptedFile,
  deleteFile,
  getFileByToken,
  validateToken,
  retrieveGeneratedFileLink,
  removeShareLinkFromFile
};
