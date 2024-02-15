const filesService = require("./files.service");

async function buildUniqueNameForUser(fileName, username) {
  const extStartIndex = fileName.lastIndexOf(".");
  const baseName = fileName.slice(0, extStartIndex);
  const extName = fileName.slice(extStartIndex + 1, fileName.length);

  let uniqueFilename = fileName;
  let uniqueNumber = 0;

  while (true) {
    const doesFilenameExistsForUser =
      await filesService.doesFilenameExistsForUser(uniqueFilename, username);

    if (!doesFilenameExistsForUser) {
      break;
    }
    uniqueFilename = getNumberedFilename(baseName, extName, ++uniqueNumber);
  }

  return uniqueFilename;
}

function getNumberedFilename(baseName, extension, number) {
  if (!extension) {
    return `${baseName} ${number}`;
  }

  return `${baseName} (${number}).${extension} `;
}

module.exports = {
  buildUniqueNameForUser,
};
