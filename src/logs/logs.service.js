const database = require("../service/database.service");
const config = require("../config");

async function insertLog(log) {
  return database.getCollection(config.COLLECTION_NAMES_LOGS).insertOne(log);
}

async function getLogs() {
  return database.getCollection(config.COLLECTION_NAMES_LOGS).find().toArray();
}

module.exports = {
  insertLog,
  getLogs,
};
