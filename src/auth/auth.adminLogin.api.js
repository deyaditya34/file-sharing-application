const httpError = require("http-errors");

const buildApiHandler = require("../api-utils/build-api-handler");
const authService = require("./auth.service");

async function controller(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new httpError.BadRequest(
      `username or passwor is missing from req.body`
    );
  }

  const token = await authService.loginAdminUser(username, password);

  res.json({
    message: "user logged in",
    token: token,
  });
}

module.exports = buildApiHandler([controller]);
