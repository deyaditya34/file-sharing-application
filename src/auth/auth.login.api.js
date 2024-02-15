const httpError = require("http-errors");

const authService = require("./auth.service");
const buildApiHandler = require("../api-utils/build-api-handler");

async function controller(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new httpError.Forbidden(
      `username or passwor is missing from req.body`
    );
  }

  const token = await authService.loginUser(username, password);

  res.json({
    message: "user logged in",
    data: { token },
  });
}

module.exports = buildApiHandler([controller]);
