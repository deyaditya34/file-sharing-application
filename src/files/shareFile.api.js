const buildApiHandler = require("../api-utils/build-api-handler");
const userResolver = require("../middlewares/user-resolver");
const paramsValidator = require("../middlewares/params-validator");
const filesService = require("./files.service");
const jwtService = require("../service/jwt.service");
const config = require("../config");

async function controller(req, res) {
  const { id } = req.params;
  const { user } = req.body;

  const existingFile = filesService.getFile(id, user);

  if (!existingFile) {
    res.json({
      message: "File not found",
    });
    return;
  }

  const token = generateToken(id, user.username);
  const link = linkGenerate(token);

  res.json({
    message: "File link sent",
    fileLink: link,
  });
}

function linkGenerate(token) {
  return `http://127.0.0.1:${config.PORT_NUMBER}/files/access?fileToken=${token}`;
}

function generateToken(id, username) {
  return jwtService.createToken(
    { id: id, username: username },
    config.JWT_SECRET_KEY
  );
}

const missingParamsValidator = paramsValidator.createParamValidator(
  ["id"],
  paramsValidator.REQ_COMPONENT.PARAMS
);

module.exports = buildApiHandler([
  userResolver,
  missingParamsValidator,
  controller,
]);
