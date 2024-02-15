const httpError = require("http-errors");

const config = require("../config");
const authUtils = require("../auth/auth.utils");

const userResolver = (role) => async (req, res, next) => {
  const token = Reflect.get(req.headers, config.AUTH_TOKEN_HEADER_FIELD);

  if (!token) {
    throw new httpError.Forbidden(`Field 'token' is missing from req.headers.`);
  }

  const user = await authUtils.getUserFromToken(token);

  if (!user || user.role !== role) {
    throw new httpError.Unauthorized("invalid user");
  }

  Reflect.set(req.body, "user", user);
  next();
};

module.exports = userResolver;
