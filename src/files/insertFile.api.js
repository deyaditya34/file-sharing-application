const path = require("path");

const buildApiHandler = require("../api-utils/build-api-handler");
const config = require("../config");
const filesService = require("./files.service");
const fileNameResolver = require("../middlewares/file-name-resolver");
const {
  readAndWriteFile,
  deleteReadFile,
} = require("../middlewares/file-read-write-resolver");

async function controller(req, res) {
  const file = req.file;

  const READ_FILE_PATH = path.join(config.FILE_READ_DIRECTORY, file.filename);
  const WRITE_FILE_PATH = path.join(config.FILE_WRITE_DIRECTORY, file.filename);

  await readAndWriteFile(READ_FILE_PATH, WRITE_FILE_PATH);
  await deleteReadFile(READ_FILE_PATH);

  let parsedFileName = await fileNameResolver(file.originalname);

  await filesService.insertFile({
    fileId: file.filename,
    fileName: parsedFileName.fileName,
    fileExtension: parsedFileName.extension,
    createdAt: new Date(),
    modifiedAt: null,
    deletedAt: null,
  });

  res.json({
    message: "success",
    data: {
      fileName: file.originalname,
      fileId: file.filename,
    },
  });
}

module.exports = buildApiHandler([controller]);
