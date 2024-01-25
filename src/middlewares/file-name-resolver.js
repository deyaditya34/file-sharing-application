const filesService = require("../files/files.service");

async function fileNameResolver(fileName = "") {
  let extensionStartIndex = fileName.indexOf(".");

  if (extensionStartIndex >= 0) {
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
  } else {
    let existingFileName = await filesService.checkFileName(fileName);

    if (!existingFileName) {
      return {
        fileName: fileName,
      };
    } else {
      let count = 1;
      while (existingFileName) {
        let newFileName = `${fileName} (${count})`;

        existingFileName = await filesService.checkFileName(newFileName);

        if (!existingFileName) {
          return {
            fileName: newFileName,
          };
        }
        count++;
      }
    }
  }
}

module.exports = fileNameResolver;

