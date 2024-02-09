const buildApiHandler = require("../api-utils/build-api-handler");
const userResolver = require("../middlewares/user-resolver")
const logsService = require("./logs.service")

async function controller(req, res) {
  const logs = await logsService.getLogs();

  res.json({
    message: "logs found",
    logs
  })


}

module.exports = buildApiHandler([userResolver("admin"), controller])