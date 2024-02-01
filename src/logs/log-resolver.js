const logsService = require("./logs.service");
const {finalLogs, logMaker} = require("./log-events");

async function logResolver(req, res, next) {
  const { url, method } = req;

  const timeStampStart = Date.now();
  logMaker({url, method, timeStampStart})
  
  res.on("close", async () => {
    const timeStampEnd = Date.now();
    const statusCode = res.statusCode;
    const responseTime = timeStampEnd - timeStampStart;
    
    logMaker({timeStampEnd, responseTime, statusCode})
    
   
    console.log(finalLogs)
    await logsService.insertLog(finalLogs);
  });

  next();
}


module.exports = {logResolver};
