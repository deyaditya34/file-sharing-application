const path = require("path");
const fs = require("fs-extra");

const config = require("../config");
const buildApiHandler = require("../api-utils/build-api-handler");
const userResolver = require("../middlewares/user-resolver");
const {
  createParamValidator,
  REQ_COMPONENT,
} = require("../middlewares/params-validator");

const filesService = require("./files.service");
const { decipher } = require("../middlewares/file-decryption");

async function controller(req, res) {
  const { id } = req.query;
  const { user } = req.body;

  const existingFile = await filesService.getFile(id, user.username);

  if (!existingFile) {
    res.json({
      message: `No file found for the id - ${id}`,
    });
    return;
  }

  const READ_FILE_PATH = path.join(config.FILE_WRITE_DIRECTORY, id);

  res.setHeader(
    "Content-Type",
    `${existingFile.mimeType}`
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${existingFile.fileName}`
  );

  const fsReadStream = fs.createReadStream(READ_FILE_PATH);

  fsReadStream.pipe(decipher).pipe(res);

  fsReadStream.on("error", (err) => {
    console.error(
      `Error in streaming the file - '${existingFile.fileName}': ${err}`
    );
    res.status(500).json({
      message: "Internal Server Error",
    });
  });

  res.on("finish", () => {
    fsReadStream.close();
  });
}

const missingParamsValidator = createParamValidator(
  ["id"],
  REQ_COMPONENT.QUERY
);

module.exports = buildApiHandler([
  userResolver,
  missingParamsValidator,
  controller,
]);
