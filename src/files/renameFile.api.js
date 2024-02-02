const buildApiHandler = require("../api-utils/build-api-handler");
const filesService = require("./files.service");
const paramsValidator = require("../middlewares/params-validator");
const fileUtils = require("./file.utils")
const userResolver = require("../middlewares/user-resolver");
const { logReceiver } = require("../logs/log-events");
const config = require("../config");

async function controller(req, res) {
  const { id } = req.params;
  const { newName, user } = req.body;

  const existingFile = await filesService.doesFileIdExistsForUser(id, user);

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

  let newUniqueName = await fileUtils.buildUniqueNameForUser(newName, user.username);

  await filesService.renameFile(id, user.username, newUniqueName);

  logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
    fileId: id,
    fileName: newUniqueName,
    username: user.username,
    resMessage: "file name changed",
  });

  res.json({
    message: "file name changed",
    data: newUniqueName,
  });
}

const missingQueryParamsValidator = paramsValidator.createParamValidator(
  ["id"],
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
