const httpError = require("http-errors");

const {logReceiver} = require("../logs/log-events");
const config = require("../config");

const createParamValidator =
  (params = [], reqComponent) =>
  (req, res, next) => {
    const {user} = req.body;
    const parsedParams = Reflect.get(req, reqComponent);
    
    const missingParams = params.filter((param) => {
      return !Reflect.has(parsedParams, param);
    });

    if (missingParams.length > 0) {
      logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
        username: user.username,
        APIERROR: `Fields ${missingParams.join(",")} are missing from ${reqComponent}`
      })
      throw new httpError.BadRequest(
        `Fields ${missingParams.join(",")} are missing from ${reqComponent}`
      );
    }

    next();
  };

const REQ_COMPONENT = {
  PARAMS: "params",
  QUERY: "query",
  BODY: "body",
};

module.exports = {
  createParamValidator,
  REQ_COMPONENT
};
