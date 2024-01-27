const authService = require("./auth.service");
const buildApiHandler = require("../api-utils/build-api-handler");
const paramsValidator = require("../middlewares/params-validator");

async function controller(req, res) {
  const { username, password } = req.body;

  const token = await authService.loginUser(username, password);

  res.json({
    message: "user logged in",
    token: token,
  });
}

const missingParamsValidator = paramsValidator.createParamValidator(
  ["username", "password"],
  paramsValidator.REQ_COMPONENT.BODY
);

module.exports = buildApiHandler([missingParamsValidator, controller]);
