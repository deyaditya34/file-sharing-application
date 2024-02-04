const crypto = require("crypto");
const fs = require("fs-extra");

const filesService = require("./files.service")
const config = require("../config");

const key_length = 24;

const key = crypto.scryptSync(
  config.ENCRYPTION_PASSWORD,
  config.ENCRYPTED_PASSWORD_SALT,
  key_length
);

const iv = crypto.randomFillSync(new Uint8Array(16));

async function encryptAndStoreFile(
  readFilePath,
  writeFilePath,
  ) {
  const cipher = crypto.createCipheriv(config.ENCRYPTION_ALGORITHM, key, iv);

  const fsReadStream = fs.createReadStream(readFilePath);
  const fsWriteStream = fs.createWriteStream(writeFilePath);

  fsReadStream.pipe(cipher).pipe(fsWriteStream);
  
  fsWriteStream.on("finish", ()=> {
    console.log(`Finished writing to '${writeFilePath}'`)
  })
}

const decipher =  crypto.createDecipheriv(config.ENCRYPTION_ALGORITHM, key, iv);


async function deleteFile(readFilePath) {
  fs.remove(readFilePath)
    .then(() => {
      console.log(`'${readFilePath}' emptied..`);
    })
    .catch((err) => {
      console.log("Unable to delete uploaded file -", err);
    });
}

async function buildUniqueNameForUser(fileName, username) {
  const extStartIndex = fileName.lastIndexOf(".");
  const baseName = fileName.slice(0, extStartIndex);
  const extName = fileName.slice(extStartIndex + 1, fileName.length);

  let uniqueFilename = fileName;
  let uniqueNumber = 0;

  while (true) {
    const doesFilenameExistsForUser = await filesService.doesFilenameExistsForUser(
      uniqueFilename,
      username
    );
    
    if (!doesFilenameExistsForUser) {
      break;
    }
    uniqueFilename = getNumberedFilename(baseName, extName, ++uniqueNumber);
  }

  return uniqueFilename;
}

function getNumberedFilename(baseName, extension, number) {
  if (!extension) {
    return `${baseName} ${number}`;
  }

  return `${baseName} (${number}).${extension} `;
}

module.exports = {
  buildUniqueNameForUser,
  encryptAndStoreFile,
  decipher,
  deleteFile
}