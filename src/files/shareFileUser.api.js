const buildApiHandler = require("../api-utils/build-api-handler");
const userResolver = require("../middlewares/user-resolver");
const paramsValidator = require("../middlewares/params-validator");
const filesService = require("./files.service");
const authService = require("../auth/auth.service");

async function controller(req, res) {
  const { fileId, receiverUsername } = req.query;
  const { user } = req.body;

  const existingFile = await filesService.getFile(fileId, user.username);

  if (!existingFile) {
    res.json({
      message: `No file found for the id - ${fileId}`,
    });
    return;
  }

  const existingReceiverUser = await validateReceiverUsername(receiverUsername);

  if (!existingReceiverUser) {
    res.json({
      message: `No user found for the username - '${receiverUsername}'`,
    });
  }

  await filesService.shareFile(fileId, receiverUsername);

  res.json({
    message: `File - '${fileId}' shared with user - '${receiverUsername}'.`,
  });
}


async function validateReceiverUsername(username) {
  return authService.findUserByUsername(username);
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
