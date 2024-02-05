const path = require("path");

const buildApiHandler = require("../api-utils/build-api-handler");
const { logReceiver } = require("../logs/log-events");
const userResolver = require("../middlewares/user-resolver");
const jwtService = require("../service/jwt.service");
const paramsValidator = require("../middlewares/params-validator");
const config = require("../config");
const filesService = require("./files.service");

async function controller(req, res) {
  const { token } = req.query;
  const { user } = req.body;

  const fileDetails = decodeLink(token);

  const existingFileRecord = await filesService.getFile(
    fileDetails.fileId,
    fileDetails.username
  );

  if (!existingFileRecord) {
    logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
      username: user.username,
      token,
      fileId: fileDetails.fileId,
      resMessage: "No file found for the given link",
    });

    res.json({
      success: "false",
      message: "No file found for the given link",
    });
  }

  const storeFilePath = path.join(config.SRC_DIR, fileDetails.fileId);

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  );

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${existingFileRecord.fileName}`
  );

  try {
    await filesService.getFileByToken(
      token,
      storeFilePath,
      res,
      fileDetails.fileId,
      existingFileRecord.fileName,
      user.username
    );
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "internal server error",
      data: err,
    });
  }
}

function decodeLink(token) {
  let payload = jwtService.decodeToken(token);

  return {
    fileId: payload.id,
    username: payload.username,
  };
}

const missingParamsValidator = paramsValidator.createParamValidator(
  ["token"],
  paramsValidator.REQ_COMPONENT.QUERY
);

module.exports = buildApiHandler([
  userResolver,
  missingParamsValidator,
  controller,
]);
