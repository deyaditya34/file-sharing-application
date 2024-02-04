const path = require("path");

const buildApiHandler = require("../api-utils/build-api-handler");
const { logReceiver } = require("../logs/log-events");
const userResolver = require("../middlewares/user-resolver");
const config = require("../config");
const filesService = require("./files.service");
const fileUtils = require("./file.utils");

async function controller(req, res) {
  const file = req.file;
  const { user } = req.body;

  const tmpPath = path.join(config.SRC_DIR, file.filename);
  const finalpath = path.join(config.DEST_DIR, file.filename);

  let uniqueName = await fileUtils.buildUniqueNameForUser(file.originalname, user.username);

  

  await fileUtils.encryptAndStoreFile(tmpPath, finalpath)
  await fileUtils.deleteFile(tmpPath)

  const fileRecord = {
    fileId: file.filename,
    fileName: uniqueName,
    mimeType: file.mimetype,
    createdAt: new Date(),
    user: user.username,
    sharedWith: [],
  }

  await filesService.insertFile(fileRecord);

  logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
    ...fileRecord,
    resMessage: "File inserted to DB and Disk"
  });

  res.json({
    message: "success",
    data: fileRecord
  });
}

module.exports = buildApiHandler([userResolver, controller]);
