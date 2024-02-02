const path = require("path");

const buildApiHandler = require("../api-utils/build-api-handler");
const { logReceiver } = require("../logs/log-events");
const userResolver = require("../middlewares/user-resolver");
const config = require("../config");
const filesService = require("./files.service");
const fileNameResolver = require("../middlewares/file-name-resolver");
const fileUtils = require("./file.utils");

async function controller(req, res) {
  const file = req.file;
  const { user } = req.body;

  const tmpPath = path.join(config.SRC_DIR, file.filename);
  const finalpath = path.join(config.DEST_DIR, file.filename);

  let parsedFileName = await fileNameResolver(file.originalname, user);

  await fileEncryption.encryptingAndStoringData(
    READ_FILE_PATH,
    WRITE_FILE_PATH,
    parsedFileName.originalName
  );

  await filesService.insertFile({
    fileId: file.filename,
    fileName: parsedFileName.originalName,
    fileExtension: parsedFileName.extension,
    mimeType: file.mimetype,
    createdAt: new Date(),
    modifiedAt: null,
    deletedAt: null,
    user: user,
    sharedWith: [],
  });

  logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
    username: user.username,
    fileId: file.filename,
    fileName: parsedFileName.originalName,
    fileExtension: parsedFileName.extension,
    mimeType: file.mimetype,
    createdAt: new Date(),
    user: user,
    sharedWith: [],
    resMessage: "File inserted to DB and Disk"
  });
  res.json({
    message: "success",
    data: {
      fileName: parsedFileName.originalName,
      fileId: file.filename,
    },
  });
}

module.exports = buildApiHandler([userResolver, controller]);
