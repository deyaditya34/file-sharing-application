const path = require("path");

const buildApiHandler = require("../api-utils/build-api-handler");
const userResolver = require("../middlewares/user-resolver");
const config = require("../config");
const filesService = require("./files.service");
const fileNameResolver = require("../middlewares/file-name-resolver");
const fileEncryption = require("../middlewares/file-encryption");

async function controller(req, res) {
  const file = req.file;
  const { user } = req.body;

  const READ_FILE_PATH = path.join(config.FILE_READ_DIRECTORY, file.filename);
  const WRITE_FILE_PATH = path.join(config.FILE_WRITE_DIRECTORY, file.filename);

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
    createdAt: new Date(),
    modifiedAt: null,
    deletedAt: null,
    user: user,
    sharedWith: [],
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
