const buildApiHandler = require("../api-utils/build-api-handler");
const filesService = require("./files.service");
const paramsValidator = require("../middlewares/params-validator");
const fileUtils = require("./file.utils")
const userResolver = require("../middlewares/user-resolver");
const { logReceiver } = require("../logs/log-events");
const config = require("../config");

async function controller(req, res) {
  const { fileId } = req.params;
  const { newName, user } = req.body;

  let newUniqueName = await fileUtils.buildUniqueNameForUser(newName, user.username);
  
  const updateFileRecord = await filesService.renameFile(fileId, user.username, newUniqueName);

  if (!updateFileRecord.modifiedCount) {
    logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
      fileId,
      username: user.username,
      resMessage: `No file found for the id - ${fileId}`,
    });
    res.json({
      success: updateFileRecord.acknowledged,
      data: `No file found for the id - ${fileId}`,
    });
    return;
  }

  logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
    fileId,
    fileName: newUniqueName,
    username: user.username,
    resMessage: "file name changed",
  });

  res.json({
    success: updateFileRecord.acknowledged,
    message: "file name changed",
    data: newUniqueName,
    
  });
}

const missingQueryParamsValidator = paramsValidator.createParamValidator(
  ["fileId"],
  paramsValidator.REQ_COMPONENT.PARAMS
);

const missingBodyParamsValidator = paramsValidator.createParamValidator(
  ["newName"],
  paramsValidator.REQ_COMPONENT.BODY
);

module.exports = buildApiHandler([
  userResolver,
  missingQueryParamsValidator,
  missingBodyParamsValidator,
  controller,
]);
