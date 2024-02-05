const buildApiHandler = require("../api-utils/build-api-handler");
const { logReceiver } = require("../logs/log-events");
const userResolver = require("../middlewares/user-resolver");
const paramsValidator = require("../middlewares/params-validator");
const filesService = require("./files.service");
const config = require("../config");

async function controller(req, res) {
  const { fileId } = req.params;
  const { user } = req.body;

  const deleteFileRecord = await filesService.changeFileStatusToDelete(fileId, user.username);

  if (!deleteFileRecord) {
    logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
      fileId,
      username: user.username,
      resMessage: `File - '${fileId}' already deleted or not file found to delete.`,
    });

    res.json({
      success: false,
      message: `File - '${fileId}' already deleted or not file found to delete.`,
    });
    return;
  }

  if (deleteFileRecord.modifiedCount) {
    logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
      fileId,
      username: user.username,
      resMessage: "File deleted",
    });

    res.json({
      success: true,
      message: "File deleted",
      data: deleteFileRecord.modifiedCount,
    });
  }
}

const missingParamsValidator = paramsValidator.createParamValidator(
  ["fileId"],
  paramsValidator.REQ_COMPONENT.PARAMS
);

module.exports = buildApiHandler([
  userResolver,
  missingParamsValidator,
  controller,
]);
