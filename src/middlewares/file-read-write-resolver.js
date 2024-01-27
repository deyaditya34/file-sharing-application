const fs = require("fs-extra");

// async function readAndWriteFile(readFilePath, writeFilePath, fileName) {
//   fs.readFile(readFilePath, async (err, data) => {
//     if (err) {
//       console.error(`File - ${fileName} read error :`, err);
//     } else {
//       stringifyData = data.toString();

//       fs.writeFile(writeFilePath, stringifyData, (err) => {
//         if (err) {
//           console.error(`File - ${fileName} write error :`, err);
//         }
//       });
//     }
//   });
// }

async function deleteReadFile(readFilePath, fileName) {
  fs.remove(readFilePath)
    .then(() => {
      console.log(`Upload File - '${fileName}' deleted from '${readFilePath}'`);
    })
    .catch((err) => {
      console.log("Unable to delete upload file -", err);
    });
}

module.exports = { deleteReadFile };
