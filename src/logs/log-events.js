const events = require("events");
const config = require("../config");

const logReceiver = new events.EventEmitter();

const finalLogs = {};

function logMaker(logs = {}) {
  const logsKeys = Object.keys(logs);
  
  logsKeys.forEach((log) => {
    finalLogs[log] = Reflect.get(logs, log);
  });
}

logReceiver.on(config.EVENT_NAME_LOG_COLLECTION, logMaker);

module.exports = {
  logReceiver,
  logMaker,
  finalLogs,
};
