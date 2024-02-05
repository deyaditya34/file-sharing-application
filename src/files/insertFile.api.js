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

  const tmpPath = path.join(config.TEMP_DIR, file.filename);
  const storePath = path.join(config.SRC_DIR, file.filename);

  let uniqueName = await fileUtils.buildUniqueNameForUser(
    file.originalname,
    user.username
  );

  const storeEncryptFile = await filesService.storeEncryptedFile(
    tmpPath,
    storePath
  );
  
  try {
    filesService.deleteFile(tmpPath)
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Not able to delete the temp uploaded file"
    })
  }

  const fileRecord = {
    fileId: file.filename,
    fileName: uniqueName,
    mimeType: file.mimetype,
    createdAt: new Date(),
    username: user.username,
    status: "active",
  };

  await filesService.insertFile(fileRecord);

  logReceiver.emit(config.EVENT_NAME_LOG_COLLECTION, {
    ...fileRecord,
    resMessage: "File inserted to DB and Disk",
  });

  res.json({
   success: true,
    data: fileRecord,
    message: storeEncryptFile
  });
}

module.exports = buildApiHandler([userResolver, controller]);
