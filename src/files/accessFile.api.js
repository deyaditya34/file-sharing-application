const path = require("path");
const fs = require("fs-extra");

const buildApiHandler = require("../api-utils/build-api-handler");
const { logReceiver } = require("../logs/log-events");
const userResolver = require("../middlewares/user-resolver");
const jwtService = require("../service/jwt.service");
const paramsValidator = require("../middlewares/params-validator");
const config = require("../config");
const filesService = require("./files.service");
const { decipher } = require("../middlewares/file-decryption");

async function controller(req, res) {
  const { fileToken } = req.query;
  const { user } = req.body;

  const fileDetails = decodeId(fileToken);

  const existingFile = await filesService.getFile(
    fileDetails.fileId,
    fileDetails.username
  );

  if (!existingFile) {
    logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
      username: user.username,
      fileLink: fileToken,
      fileId: fileDetails.fileId,
      resMessage: "No file found for the given link",
    });
    res.json({
      message: "No file found for the given link",
    });
    return;
  }

  const READ_FILE_PATH = path.join(
    config.FILE_WRITE_DIRECTORY,
    existingFile.fileId
  );

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${existingFile.fileName}`
  );

  const fsReadStream = fs.createReadStream(READ_FILE_PATH);

  fsReadStream.pipe(decipher).pipe(res);

  fsReadStream.on("error", (err) => {
    console.error(
      `Error in streaming the file - '${existingFile.fileName}': ${err}`
    );
    logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
      username: user.username,
      fileLink: fileToken,
      fileId: fileDetails.fileId,
      APIError: `Error in streaming the file - '${existingFile.fileName}': ${err}`,
      resMessage: "Internal Server Error",
    });
    res.status(500).json({
      message: "Internal Server Error",
    });
  });

  res.on("finish", () => {
    logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
      username: user.username,
      fileLink: fileToken,
      fileId: fileDetails.fileId,
      resMessage: "File downloaded",
    });
    fsReadStream.close();
  });
}

function decodeId(token) {
  let payload = jwtService.decodeToken(token, config.JWT_SECRET_KEY);

  return {
    fileId: payload.id,
    username: payload.username,
  };
}

const missingParamsValidator = paramsValidator.createParamValidator(
  ["fileToken"],
  paramsValidator.REQ_COMPONENT.QUERY
);

module.exports = buildApiHandler([
  userResolver,
  missingParamsValidator,
  controller,
]);
