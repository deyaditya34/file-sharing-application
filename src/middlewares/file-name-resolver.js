const filesService = require("../files/files.service");

async function fileNameResolver(fileName = "") {
  let extensionStartIndex = fileName.indexOf(".");
  let baseName = fileName.slice(0, extensionStartIndex);
  let extension = fileName.slice(extensionStartIndex, fileName.length);

  let existingFileName = await filesService.checkFileName(fileName);

  if (!existingFileName) {
    return {
      fileName: fileName,
      extension: extension,
    };
  } else {
    let count = 1;
    while (existingFileName) {
      let newFileName = `${baseName} (${count})${extension}`;

      existingFileName = await filesService.checkFileName(newFileName);

      if (!existingFileName) {
        return {
          fileName: newFileName,
          extension: extension,
        };
      }
      count++;
    }
  }
}

module.exports = fileNameResolver;
