const httpError = require("http-errors");

const createParamValidator =
  (params = [], reqComponent) =>
  (req, res, next) => {
    const parsedParams = Reflect.get(req, reqComponent);
    
    const missingParams = params.filter((param) => {
      return !Reflect.has(parsedParams, param);
    });

    if (missingParams.length > 0) {
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
