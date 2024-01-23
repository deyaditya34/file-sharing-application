const express = require("express");
const multer = require("multer");
const upload = multer({dest : "uploads"})

const insertFileApi = require("./insertFile.api");
const renameFileApi = require("./renameFile.api");
const getFileNameApi = require("./getFileName.api");
const getFileApi = require("./getFile.api");

const router = express.Router();

router.post("/", upload.single("file"), insertFileApi);
router.post("/rename", renameFileApi)
router.get("/fileName", getFileNameApi)
router.get("/file", getFileApi)


module.exports = router;
