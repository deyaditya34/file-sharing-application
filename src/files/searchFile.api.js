const buildApiHandler = require("../api-utils/build-api-handler");
const { searchFile } = require("./files.service");
const userResolver = require("../middlewares/user-resolver");
const config = require("../config");
const { logReceiver } = require("../logs/log-events");

async function controller(req, res) {
  const { user } = req.body;
  let parsedQueries = parsedQueryVal(req, "query");

  let parsedFilters = parseFilters(parsedQueries);

  const result = await searchFile(parsedFilters, user.username);

  if (result.length === 0) {
    logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
      username: user.username,
      searchFilters: parsedFilters,
      resMessage: "No file found",
    });

    res.json({
      message: "No file found",
    });
    return;
  }

  logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
    username: user.username,
    searchFilters: parsedFilters,
    data: result,
    resMessage: "file found",
  });

  res.json({
    message: "file found",
    data: result,
  });
}

function parsedQueryVal(obj, key) {
  const queryKeys = Object.keys(obj[`${key}`]);

  const result = {};

  queryKeys.forEach((query, i) => {
    result[`${query}`] = obj[`${key}`][`${query}`];
  });

  return result;
}

function parseFilters(obj) {
  let result = {};

  if (Reflect.has(obj, "id")) {
    let id = Reflect.get(obj, "id");
    result.id = id;
  }

  if (Reflect.has(obj, "fileName")) {
    let fileName = Reflect.get(obj, "fileName");
    result.fileName = fileName;
  }

  if (
    Reflect.has(obj, "greaterThanEqualDate") &&
    Reflect.has(obj, "lesserThanEqualDate")
  ) {
    let greaterThanEqualDate = Reflect.get(obj, "greaterThanEqualDate");
    let lesserThanEqualDate = Reflect.get(obj, "lesserThanEqualDate");

    result.createdAt = {
      $gte: new Date(`${greaterThanEqualDate}`),
      $lte: new Date(`${lesserThanEqualDate}`),
    };
    return result;
  }

  if (Reflect.has(obj, "greaterThanEqualDate")) {
    let greaterThanEqualDate = Reflect.get(obj, "greaterThanEqualDate");
    result.createdAt = { $gte: new Date(`${greaterThanEqualDate}`) };
  }

  if (Reflect.has(obj, "lesserThanEqualDate")) {
    let lesserThanEqualDate = Reflect.get(obj, "lesserThanEqualDate");
    result.createdAt = { $lte: new Date(`${lesserThanEqualDate}`) };
  }

  return result;
}

module.exports = buildApiHandler([userResolver, controller]);
