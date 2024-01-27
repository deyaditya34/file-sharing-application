require("dotenv").config();

module.exports = {
  MONGOURI: process.env.MONGOURI,
  DB_NAME: process.env.DB_NAME,
  PORT_NUMBER: process.env.PORT_NUMBER,
  MYFILES: process.env.COLLECTION_NAME_FILES,
  FILE_WRITE_DIRECTORY: process.env.FILE_WRITE_DIRECTORY,
  FILE_READ_DIRECTORY: process.env.FILE_READ_DIRECTORY,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  AUTH_TOKEN_HEADER_FIELD: process.env.AUTH_TOKEN_HEADER_FIELD,
  COLLECTION_NAME_USERS: process.env.COLLECTION_NAME_USERS,
  ENCRYPTED_PASSWORD_SALT: process.env.ENCRYPTED_PASSWORD_SALT,
  ENCRYPTION_PASSWORD: process.env.ENCRYPTION_PASSWORD,
  ENCRYPTION_ALGORITHM: process.env.ENCRYPTION_ALGORITHM
};
