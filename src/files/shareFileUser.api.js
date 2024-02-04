const buildApiHandler = require("../api-utils/build-api-handler");
const userResolver = require("../middlewares/user-resolver");
const paramsValidator = require("../middlewares/params-validator");
const filesService = require("./files.service");
const authService = require("../auth/auth.service");
const config = require("../config");
const {logReceiver} = require("../logs/log-events");

async function controller(req, res) {
  const { id, receiverUsername } = req.params;
  const { user } = req.body;

  const existingFile = await filesService.getFile(id, user.username);

  if (!existingFile) {
    logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
      fileId,
      receiverUsername,
      username: user.username,
      resMessage: `No file found for the id - ${id}`
    })

    res.json({
      message: `No file found for the id - ${id}`,
    });
    return;
  }

  const existingReceiverUser = await validateReceiverUsername(receiverUsername, "user");

  if (!existingReceiverUser) {
    logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
      fileId: id,
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
    fileId: id,
    fileName: existingFile.fileName,
    receiverUsername,
    username: user.username,
    resMessage: `File - '${id}' shared with user - '${receiverUsername}'.`
  })

  res.json({
    message: `File - '${id}' shared with user - '${receiverUsername}'.`,
  });
}


async function validateReceiverUsername(username, role) {
  return authService.findUserByUsername(username, role);
}


const missingParamsValidator = paramsValidator.createParamValidator(
  ["id", "receiverUsername"],
  paramsValidator.REQ_COMPONENT.PARAMS
);


module.exports = buildApiHandler([
  userResolver,
  missingParamsValidator,
  controller,
]);
