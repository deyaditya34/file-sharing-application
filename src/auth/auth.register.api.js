const authUtils = require("./auth.utils");
const authService = require("./auth.service");
const buildApiHandler = require("../api-utils/build-api-handler");
const paramsValidator = require("../middlewares/params-validator");

async function controller(req, res) {
  const { username, password } = req.body;

  const existingUser = await authService.findUserByUsername(username);

  if (existingUser) {
    res.json({
      message: `username - '${username}' is already taken.`,
    });
    return;
  }

  const user = authUtils.buildUser(username, password);

  await authService.registerUser(user);

  res.json({
    success: true,
    message: "registration done",
    data: username,
  });
}

const missingParamsValidator = paramsValidator.createParamValidator(
  ["username", "password"],
  paramsValidator.REQ_COMPONENT.BODY
);

module.exports = buildApiHandler([missingParamsValidator, controller]);
