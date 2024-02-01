const buildApiHandler = require("../api-utils/build-api-handler");
const userResolver = require("../middlewares/user-resolver");
const paramsValidator = require("../middlewares/params-validator");
const filesService = require("./files.service");
const authService = require("../auth/auth.service");
const config = require("../config");
const {logReceiver} = require("../logs/log-events");

async function controller(req, res) {
  const { fileId, receiverUsername } = req.query;
  const { user } = req.body;

  const existingFile = await filesService.getFile(fileId, user.username);

  if (!existingFile) {
    logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
      fileId,
      receiverUsername,
      username: user.username,
      resMessage: `No file found for the id - ${fileId}`
    })

    res.json({
      message: `No file found for the id - ${fileId}`,
    });
    return;
  }

  const existingReceiverUser = await validateReceiverUsername(receiverUsername, "user");

  if (!existingReceiverUser) {
    logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
      fileId,
      fileName: existingFile.fileName,
      receiverUsername,
      username: user.username,
      resMessage: `No user found for the username - '${receiverUsername}'`
    })

    res.json({
      message: `No user found for the username - '${receiverUsername}'`,
    });
  }

  await filesService.shareFile(fileId, receiverUsername);

  logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
    fileId,
    fileName: existingFile.fileName,
    receiverUsername,
    username: user.username,
    resMessage: `File - '${fileId}' shared with user - '${receiverUsername}'.`
  })

  res.json({
    message: `File - '${fileId}' shared with user - '${receiverUsername}'.`,
  });
}


async function validateReceiverUsername(username, role) {
  return authService.findUserByUsername(username, role);
}


const missingParamsValidator = paramsValidator.createParamValidator(
  ["fileId", "receiverUsername"],
  paramsValidator.REQ_COMPONENT.QUERY
);


module.exports = buildApiHandler([
  userResolver,
  missingParamsValidator,
  controller,
]);
