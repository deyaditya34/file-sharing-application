const buildApiHandler = require("../api-utils/build-api-handler");
const filesService = require("./files.service");
const paramsValidator = require("../middlewares/params-validator");
const fileNameResolver = require("../middlewares/file-name-resolver");
const userResolver = require("../middlewares/user-resolver")

async function controller(req, res) {
  const { id } = req.query;
  const {newName, user} = req.body;

  const existingFile = await filesService.getFile(id, user);

  if (!existingFile) {
    res.json({
      message: `No file found for the id - ${id}`,
    });
    return;
  }

  let parsedFileName = await fileNameResolver(newName);

  await filesService.renameFileName(id, parsedFileName.fileName, user);

  res.json({
    message: "file name changed",
    name : parsedFileName.fileName,
    extension : parsedFileName.extension
  })
}

const missingQueryParamsValidator = paramsValidator.createParamValidator(
  ["id"],
  paramsValidator.REQ_COMPONENT.QUERY
);

const missingBodyParamsValidator = paramsValidator.createParamValidator(
  ["newName"],
  paramsValidator.REQ_COMPONENT.BODY
);

module.exports = buildApiHandler([userResolver, missingQueryParamsValidator, missingBodyParamsValidator, controller]);
