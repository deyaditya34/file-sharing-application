const express = require("express");
const router = express.Router();

const getLogsApi = require("./getLogs.api");


router.get("/", getLogsApi)


module.exports = router