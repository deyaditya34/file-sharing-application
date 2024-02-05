const httpError = require("http-errors");

const buildApiHandler = require("../api-utils/build-api-handler");
const userResolver = require("../middlewares/user-resolver");
const paramsValidator = require("../middlewares/params-validator");
const filesService = require("./files.service");
const jwtService = require("../service/jwt.service");
const config = require("../config");
const { logReceiver } = require("../logs/log-events");
const { findUserByUsername } = require("../auth/auth.service");

async function controller(req, res) {
  const { fileId } = req.params;
  const { user, method, receiverUsername } = req.body;

  try {
    validateMethod(req.body);

    await validateUsername(req.body, user.username);
  } catch (err) {
    res.send(err);
  }

  const existingFileRecord = await filesService.getFile(fileId, user.username);

  if (!existingFileRecord) {
    logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
      fileId,
      username: user.username,
      resMessage: "File not found",
    });
    res.json({
      success: false,
      message: "File not found",
    });
    return;
  }

  const fileShareDetails = {};

  if (method === "WITH_USER") {
    fileShareDetails.method = method;
    fileShareDetails.target = receiverUsername;

    await filesService.shareFileWithUser(fileId, fileShareDetails);

    logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
      fileId,
      fileName: existingFileRecord.fileName,
      receiverUsername,
      username: user.username,
      resMessage: `File - '${fileId}' shared with user - '${receiverUsername}'.`,
    });

    res.json({
      message: `File - '${fileId}' shared with user - '${receiverUsername}'.`,
    });
  }

  if (method === "BY_LINK") {
    const token = generateToken(fileId, user.username);
    const link = linkGenerate(token);

    fileShareDetails.method = method;
    fileShareDetails.token = token;
    
    await filesService.shareFileWithUser(fileId, fileShareDetails);

    logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
      fileId,
      username: user.username,
      data: link,
      resMessage: "File link sent",
    });

    res.json({
      success: true,
      message: "File link sent",
      data: link,
    });
  }
}

function linkGenerate(token) {
  return `http://127.0.0.1:${config.PORT_NUMBER}/files/by-token?token=${token}`;
}

function generateToken(id, username) {
  return jwtService.createToken({ id: id, username: username });
}

function validateMethod(obj) {
  if (obj.method !== "WITH_USER" && obj.method !== "BY_LINK") {
    throw new httpError.BadRequest(
      `Field 'method' should be either 'WITH_USER' or 'BY_LINK'`
    );
  }
}

async function validateUsername(obj, username) {
  if (obj.method === "WITH_USER") {
    if (!obj.receiverUsername) {
      throw new httpError.BadRequest(
        `Field 'receiverUsername' is missing from 'req.body'`
      );
    }
    if (obj.receiverUsername === username) {
      throw new httpError.BadRequest(
        `User cannot share the file with - '${obj.receiverUsername}'`
      );
    }

    const existingReceiverUsername = await findUserByUsername(
      obj.receiverUsername
    );

    if (!existingReceiverUsername) {
      throw new httpError.BadRequest(
        `Field receiverUsername - ${obj.receiverUsername} received invalid user.`
      );
    }
  }
}

const missingParamsValidatorInParams = paramsValidator.createParamValidator(
  ["fileId"],
  paramsValidator.REQ_COMPONENT.PARAMS
);

const missingParamsValidatorInBody = paramsValidator.createParamValidator(
  ["method"],
  paramsValidator.REQ_COMPONENT.BODY
);

module.exports = buildApiHandler([
  userResolver,
  missingParamsValidatorInParams,
  missingParamsValidatorInBody,
  controller,
]);
