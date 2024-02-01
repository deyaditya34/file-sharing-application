const express = require("express");

const config = require("./config");

const database = require("./service/database.service");

const authRouter = require("./auth/auth.api.router");
const filesRouter = require("./files/files.api.router");
const logRouter = require("./logs/log.api.router");

const requestLogger = require("./middlewares/request-logger");
const { logResolver } = require("./logs/log-resolver");
const notFoundHandler = require("./api-utils/not-found-handler");
const errorHandler = require("./api-utils/error-handler");

async function start() {
  console.log("Connecting to database");

  await database.initialize();
  console.log("database connected.. Connecting to server");

  const server = express();
  server.use(express.json());
  server.use(requestLogger);
  server.use(logResolver);

  server.use("/auth", authRouter);
  server.use("/files", filesRouter);
  server.use("/logs", logRouter);

  server.use(notFoundHandler);
  server.use(errorHandler);

  server.listen(config.PORT_NUMBER, () => {
    console.log(`Server is running at port number ${config.PORT_NUMBER}`);
  });
}

start();
