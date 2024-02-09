const buildApiHandler = require("../api-utils/build-api-handler");
const { searchFile } = require("./files.service");
const userResolver = require("../middlewares/user-resolver");
const config = require("../config");
const { logReceiver } = require("../logs/log-events");

async function controller(req, res) {
  const { user } = req.body;

  let parsedFilters = parseFilters(req.body);
  
  console.log(parsedFilters);
  
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

function parseFilters(obj) {
  let result = {};

  if (Reflect.has(obj, "fileName")) {
    let fileName = Reflect.get(obj, "fileName");
    result.fileName = fileName;
  }

  if (
    Reflect.has(obj["createdAt"], "from") &&
    Reflect.has(obj["createdAt"], "to")
  ) {
    let greaterThanEqualDate = Reflect.get(obj["createdAt"], "from");
    let lesserThanEqualDate = Reflect.get(obj["createdAt"], "to");
    console.log("lesser than date", lesserThanEqualDate);

    result.createdAt = {
      $gte: new Date(`${greaterThanEqualDate}`),
      $lte: new Date(`${lesserThanEqualDate}`),
    };
  } else if (Reflect.has(obj["createdAt"], "from")) {
    let greaterThanEqualDate = Reflect.get(obj["createdAt"], "from");
    result.createdAt = { $gte: new Date(`${greaterThanEqualDate}`) };
  } else if (Reflect.has(obj["createdAt"], "lesserThanEqualDate")) {
    let lesserThanEqualDate = Reflect.get(obj["createdAt"], "to");
    result.createdAt = { $lte: new Date(`${lesserThanEqualDate}`) };
  }

  if (
    Reflect.has(obj["modifiedAt"], "from") &&
    Reflect.has(obj["modifiedAt"], "to")
  ) {
    let greaterThanEqualDate = Reflect.get(obj["modifiedAt"], "from");
    let lesserThanEqualDate = Reflect.get(obj["modifiedAt"], "to");

    result.modifiedAt = {
      $gte: new Date(`${greaterThanEqualDate}`),
      $lte: new Date(`${lesserThanEqualDate}`),
    };
  } else if (Reflect.has(obj["modifiedAt"], "from")) {
    let greaterThanEqualDate = Reflect.get(obj["modifiedAt"], "from");
    result.modifiedAt = { $gte: new Date(`${greaterThanEqualDate}`) };
  } else if (Reflect.has(obj["modifiedAt"], "lesserThanEqualDate")) {
    let lesserThanEqualDate = Reflect.get(obj["modifiedAt"], "to");
    result.modifiedAt = { $lte: new Date(`${lesserThanEqualDate}`) };
  }

  if (
    Reflect.has(obj["deletedAt"], "from") &&
    Reflect.has(obj["deletedAt"], "to")
  ) {
    let greaterThanEqualDate = Reflect.get(obj["deletedAt"], "from");
    let lesserThanEqualDate = Reflect.get(obj["deletedAt"], "to");

    result.deletedAt = {
      $gte: new Date(`${greaterThanEqualDate}`),
      $lte: new Date(`${lesserThanEqualDate}`),
    };
  } else if (Reflect.has(obj["deletedAt"], "from")) {
    let greaterThanEqualDate = Reflect.get(obj["deletedAt"], "from");
    result.deletedAt = { $gte: new Date(`${greaterThanEqualDate}`) };
  } else if (Reflect.has(obj["deletedAt"], "lesserThanEqualDate")) {
    let lesserThanEqualDate = Reflect.get(obj["deletedAt"], "to");
    result.deletedAt = { $lte: new Date(`${lesserThanEqualDate}`) };
  }

  if (Reflect.has(obj, "isShared")) {
    const isSharedValue = Reflect.get(obj, "isShared");
    if (isSharedValue === true || isSharedValue === false) {
      result["shares.method"] = { $exists: isSharedValue };
    }
  }

  if (Reflect.has(obj, "sharedWith")) {
    const sharedWithValue = Reflect.get(obj, "sharedWith");

    result["shares.method"] = "WITH_USER";
    result["shares.target"] = sharedWithValue;
  }

  if (Reflect.has(obj, "status")) {
    const statusValue = Reflect.get(obj, "status");

    if (statusValue === true) {
      result.status = statusValue
    }
  }

  return result;
}

module.exports = buildApiHandler([userResolver("user"), controller]);
