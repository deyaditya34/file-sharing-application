require("dotenv").config();

module.exports = {
  MONGOURI: process.env.MONGOURI,
  DB_NAME: process.env.DB_NAME,
  PORT_NUMBER: process.env.PORT_NUMBER,
  MYFILES: process.env.COLLECTION_NAME_FILES,
  FILE_WRITE_DIRECTORY: process.env.FILE_WRITE_DIRECTORY,
  FILE_READ_DIRECTORY: process.env.FILE_READ_DIRECTORY
};
