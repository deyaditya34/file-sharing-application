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

  await filesService.shareFileWithUser(fileId, receiverUsername);

  
}


module.exports = buildApiHandler([
  userResolver,
  missingParamsValidator,
  controller,
]);
