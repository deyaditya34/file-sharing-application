const fs = require("fs-extra");
const path = require("path");

const buildApiHandler = require("../api-utils/build-api-handler");
const userResolver = require("../middlewares/user-resolver");
const paramsValidator = require("../middlewares/params-validator");
const filesService = require("./files.service");
const config = require("../config");


async function controller(req, res) {
  const {id} = req.query;
  const {user} = req.body;

  const existingFile = await filesService.getFile(id, user.username);

  if (!existingFile) {
    res.json({
      message: `No file found for the id - ${id}`
    })
    return;
  }

  await filesService.deleteFile(id, user.username);

  const WRITE_FILE_PATH = path.join(config.FILE_WRITE_DIRECTORY, id);

  fs.rmSync(WRITE_FILE_PATH);

  res.json({
    message: "File deleted",
    fileName: existingFile.fileName
  })

}

const missingParamsValidator = paramsValidator.createParamValidator(
  ["id"],
  paramsValidator.REQ_COMPONENT.QUERY
);

module.exports = buildApiHandler([userResolver,missingParamsValidator, controller]);
