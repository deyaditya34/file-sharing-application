const httpError = require("http-errors");

const config = require("../config");
const authUtils = require("../auth/auth.utils");

async function userResolver(req, res, next) {
  const token = Reflect.get(req.headers, config.AUTH_TOKEN_HEADER_FIELD);

  if (!token) {
    throw new httpError.Forbidden(`Field 'token' is missing from req.headers.`);
  }

  const user = await authUtils.getUserFromToken(token);
  console.log("user -", user)
  
  if (!user) {
    throw new httpError.Unauthorized("invalid user");
  }

  Reflect.set(req.body, "user", user);
  next();
}

module.exports = userResolver;
