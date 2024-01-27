const crypto = require("crypto");

const config = require("../config");
const { key, iv } = require("./file-encryption");

const decipher = crypto.createDecipheriv(config.ENCRYPTION_ALGORITHM, key, iv);


module.exports = { decipher };
