const crypto = require("crypto");
const fs = require("fs-extra");

const config = require("../config");

const key = crypto.scryptSync(
  config.ENCRYPTION_PASSWORD,
  config.ENCRYPTED_PASSWORD_SALT,
  24
);

const iv = crypto.randomFillSync(new Uint8Array(16));

async function encryptingAndStoringData(
  readFilePath,
  writeFilePath,
  fileName
  ) {
  const cipher = crypto.createCipheriv(config.ENCRYPTION_ALGORITHM, key, iv);

  const fsReadStream = fs.createReadStream(readFilePath);
  const fsWriteStream = fs.createWriteStream(writeFilePath);

  fsReadStream.pipe(cipher).pipe(fsWriteStream);

  fsWriteStream.on("finish", ()=> {
    console.log(`Finished writing - "${fileName}" to '${writeFilePath}'`)
  })
}

async function deleteReadFile(readFilePath, fileName) {
  fs.remove(readFilePath)
    .then(() => {
      console.log(`Upload File - '${fileName}' deleted from '${readFilePath}'`);
    })
    .catch((err) => {
      console.log("Unable to delete upload file -", err);
    });
}

async function decryptAndSendFile(filePath) {

  const decipher = crypto.createDecipheriv(config.ENCRYPTION_ALGORITHM, key, iv);

  return decipher
}