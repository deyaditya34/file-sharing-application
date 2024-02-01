const fs = require("fs-extra");
const path = require("path");

const buildApiHandler = require("../api-utils/build-api-handler");
const { logReceiver } = require("../logs/log-events");
const userResolver = require("../middlewares/user-resolver");
const paramsValidator = require("../middlewares/params-validator");
const filesService = require("./files.service");
const config = require("../config");

async function controller(req, res) {
  const { id } = req.query;
  const { user } = req.body;

  const existingFile = await filesService.getFile(id, user.username);

  if (!existingFile) {
    logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
      fileId: id,
      username: user.username,
      resMessage: `No file found for the id - ${id}`,
    });
    res.json({
      message: `No file found for the id - ${id}`,
    });
    return;
  }

  await filesService.deleteFile(id, user.username);

  const WRITE_FILE_PATH = path.join(config.FILE_WRITE_DIRECTORY, id);

  fs.rmSync(WRITE_FILE_PATH);

  logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
    fileId: id,
    fileName: existingFile.fileName,
    username: user.username,
    resMessage: "File deleted",
  });

  res.json({
    message: "File deleted",
    fileName: existingFile.fileName,
  });
}

const missingParamsValidator = paramsValidator.createParamValidator(
  ["id"],
  paramsValidator.REQ_COMPONENT.QUERY
);

module.exports = buildApiHandler([
  userResolver,
  missingParamsValidator,
  controller,
]);
