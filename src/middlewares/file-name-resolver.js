const filesService = require("../files/files.service");


async function fileNameResolver(fileName = "") {
  let existingFileName = await filesService.checkFileName(fileName);

  if (!existingFileName) {
    return fileName;
  } else {
    
    let extensionStartIndex = fileName.indexOf(".");
    let baseName = fileName.slice(0, extensionStartIndex);
    let extension = fileName.slice(extensionStartIndex, fileName.length);

    let count = 1;
    while (existingFileName) {
      let newFileName = `${baseName} (${count})${extension}`;

      existingFileName = await filesService.checkFileName(newFileName);

      if (!existingFileName) {
        return {
          fileName : newFileName,
          extension : extension
        }
      }
      count++ 
    }
  }
}

module.exports = fileNameResolver
