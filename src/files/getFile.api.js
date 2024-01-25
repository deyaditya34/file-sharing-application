const path = require("path");
const fs = require("fs-extra");
const config = require("../config");

const buildApiHandler = require("../api-utils/build-api-handler");
const {
  createParamValidator,
  REQ_COMPONENT,
} = require("../middlewares/params-validator");
const filesService = require("./files.service");

async function controller(req, res) {
  const { id } = req.query;

  const existingFile = await filesService.getFile(id);

  if (!existingFile) {
    res.json({
      message: `No file found for the id - ${id}`,
    });
    return;
  }

  const READ_FILE_PATH = path.join(config.FILE_WRITE_DIRECTORY, id);

  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${existingFile.fileName}`
  );

  const fileReadStream = fs.createReadStream(READ_FILE_PATH);

  fileReadStream.pipe(res);

  fileReadStream.on("error", (err) => {
    console.error(`Error in streaming the file: ${err}`);
    res.status(500).json({
      message: "Internal Server Error",
    });
  });

  res.on("close", () => {
    fileReadStream.close();
  });
}

const missingParamsValidator = createParamValidator(
  ["id"],
  REQ_COMPONENT.QUERY
);

module.exports = buildApiHandler([missingParamsValidator, controller]);
