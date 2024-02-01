const buildApiHandler = require("../api-utils/build-api-handler");
const adminUserResolver = require("../middlewares/admin-user-resolver")
const logsService = require("./logs.service")

async function controller(req, res) {
  const logs = await logsService.getLogs();

  res.json({
    message: "logs found",
    logs
  })


}

module.exports = buildApiHandler([adminUserResolver, controller])