const filesService = require("../files/files.service");

async function fileNameResolver(fileName = "", user = {}) {
  let extensionStartIndex = fileName.indexOf(".");

  if (extensionStartIndex >= 0) {
    let baseName = fileName.slice(0, extensionStartIndex);
    let extension = fileName.slice(extensionStartIndex, fileName.length);

    let existingFileName = await filesService.checkFileName(fileName, user);

    if (!existingFileName) {
      return {
        originalName: fileName,
        extension: extension,
      };
    } else {
      let count = 1;
      while (existingFileName) {
        let newFileName = `${baseName} (${count})${extension}`;

        existingFileName = await filesService.checkFileName(newFileName, user);

        if (!existingFileName) {
          return {
            originalName: newFileName,
            extension: extension,
          };
        }
        count++;
      }
    }
  } else {
    let existingFileName = await filesService.checkFileName(fileName, user);

    if (!existingFileName) {
      return {
        originalName: fileName,
      };
    } else {
      let count = 1;
      while (existingFileName) {
        let newFileName = `${fileName} (${count})`;

        existingFileName = await filesService.checkFileName(newFileName, user);

        if (!existingFileName) {
          return {
            originalName: newFileName,
          };
        }
        count++;
      }
    }
  }
}

module.exports = fileNameResolver;

