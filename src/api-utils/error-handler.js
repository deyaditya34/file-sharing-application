const httpError = require("http-errors");

function errorHandler(err, req, res, next) {
  console.log("[api error] :", err);

  res.status(getErrorCode()).json({
    success : false,
    error : getErrorMessage(err)
  })
}

function getErrorCode(err) {
  return  httpError.InternalServerError().statusCode;
}

function getErrorMessage(err) {
 httpError.InternalServerError().message;
}

module.exports = errorHandler;