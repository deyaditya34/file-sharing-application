const path = require("path");

const { logReceiver } = require("../logs/log-events");
const buildApiHandler = require("../api-utils/build-api-handler");
const userResolver = require("../middlewares/user-resolver");
const {
  createParamValidator,
  REQ_COMPONENT,
} = require("../middlewares/params-validator");
const filesService = require("./files.service");
const config = require("../config");

async function controller(req, res) {
  const { fileId } = req.params;
  const { user } = req.body;

  const existingFileRecord = await filesService.getFile(fileId, user.username);

  if (!existingFileRecord) {
    logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
      fileId,
      username: user.username,
      resMessage: `No file found for the id - ${fileId}`,
    });
    res.json({
      message: `No file found for the id - ${fileId}`,
    });
    return;
  }

  const storeFilepath = path.join(config.SRC_DIR, fileId);

  res.setHeader("Content-Type", `${existingFileRecord.mimeType}`);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${existingFileRecord.fileName}`
  );
  
  try {

    await filesService.sendDecryptedFile(storeFilepath, existingFileRecord, fileId, user.username, res);

  } catch (err) {
    
    res.status(500).json({
      success: false,
      message: "internal server error",
      data: err
    })
  }
}

const missingParamsValidator = createParamValidator(
  ["fileId"],
  REQ_COMPONENT.PARAMS
);

module.exports = buildApiHandler([
  userResolver("user"),
  missingParamsValidator,
  controller,
]);
