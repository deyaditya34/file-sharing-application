const buildApiHandler = require("../api-utils/build-api-handler");
const { logReceiver } = require("../logs/log-events");
const userResolver = require("../middlewares/user-resolver");
const paramsValidator = require("../middlewares/params-validator");
const filesService = require("./files.service");
const config = require("../config");

async function controller(req, res) {
  const { id } = req.params;
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
  
  let deleteFileTimeStamp = new Date();
  await filesService.deleteFile(id, user.username, deleteFileTimeStamp);

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
  paramsValidator.REQ_COMPONENT.PARAMS
);

module.exports = buildApiHandler([
  userResolver,
  missingParamsValidator,
  controller,
]);
