const authUtils = require("./auth.utils");
const authService = require("./auth.service");
const buildApiHandler = require("../api-utils/build-api-handler");
const paramsValidator = require("../middlewares/params-validator");

async function controller(req, res) {
  const { username, password } = req.body;

  const existingUsername = await authService.findUserByUsername(username);

  if (existingUsername) {
    res.json({
      message: `username - '${username}' aldready exists.`
    })
    return;
  }

  const userDetails = authUtils.buildUser(username, password);

  await authService.registerUser(userDetails);

  res.json({
    message: "registration done",
    credentials: {
      username,
      password
    },
  });
}

const missingParamsValidator = paramsValidator.createParamValidator(
  ["username", "password"],
  paramsValidator.REQ_COMPONENT.BODY
);

module.exports = buildApiHandler([missingParamsValidator, 
  controller]);
