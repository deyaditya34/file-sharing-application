const buildApiHandler = require("../api-utils/build-api-handler");
const {
  createParamValidator,
  REQ_COMPONENT,
} = require("../middlewares/params-validator");
const filesService = require("./files.service");

async function controller(req, res) {
  const { id } = req.query;

  const file = await filesService.getFileName(id);

  if (file) {
    res.json({
      message: "file found",
      fileName: file,
    });
  } else {
    res.json({
      message: `No found for the id - ${id}`,
    });
  }
}

const missingParamsValidator = createParamValidator(
  ["id"],
  REQ_COMPONENT.QUERY
);

module.exports = buildApiHandler([missingParamsValidator, controller]);
