const path = require("path");
const fs = require("fs-extra");

const { logReceiver } = require("../logs/log-events");
const buildApiHandler = require("../api-utils/build-api-handler");
const userResolver = require("../middlewares/user-resolver");
const {
  createParamValidator,
  REQ_COMPONENT,
} = require("../middlewares/params-validator");
const fileUtils = require("./file.utils")
const filesService = require("./files.service");
const config = require("../config");

async function controller(req, res) {
  const { id } = req.params;
  const { user } = req.body;

  const existingFile = await filesService.getFile(id, user.username);

  if (!existingFile) {
    logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
      id,
      username: user.username,
      resMessage: `No file found for the id - ${id}`,
    });
    res.json({
      message: `No file found for the id - ${id}`,
    });
    return;
  }

  const destPath = path.join(config.DEST_DIR, id);

  res.setHeader("Content-Type", `${existingFile.mimeType}`);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${existingFile.fileName}`
  );

  const fsReadStream = fs.createReadStream(destPath);

  fsReadStream.pipe(fileUtils.decipher).pipe(res);

  fsReadStream.on("error", (err) => {
    console.error(
      `Error in streaming the file - '${existingFile.fileName}': ${err}`
    );

    logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
      fileId: id,
      fileName: existingFile.fileName,
      username: user.username,
      resMessage: `Error in streaming the file - '${existingFile.fileName}': ${err}`,
    });

    res.status(500).json({
      message: "Internal Server Error",
    });
  });

  res.on("finish", () => {
    logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
      fileId: id,
      fileName: existingFile.fileName,
      username: user.username,
      resMessage: `File downloaded`,
    });
    fsReadStream.close();
  });
}

const missingParamsValidator = createParamValidator(
  ["id"],
  REQ_COMPONENT.PARAMS
);

module.exports = buildApiHandler([
  userResolver,
  missingParamsValidator,
  controller,
]);
