const httpError = require("http-errors");

const config = require("../config");
const authUtils = require("../auth/auth.utils");

async function adminUserResolver(req, res, next) {
  const token = Reflect.get(req.headers, config.AUTH_TOKEN_HEADER_FIELD);

  if (!token) {
    throw new httpError.Forbidden(`Field 'token' is missing from req.headers.`);
  }
  const user = await authUtils.getUserFromToken(token);

  if (!user) {
    throw new httpError.Forbidden("No user found. Token not valid.")
  }

  if (user.role !== "admin") {
    throw new httpError.Unauthorized("Access Denied. Token not valid.");
  }

  Reflect.set(req.body, "user", user);
  next();
}

module.exports = adminUserResolver
