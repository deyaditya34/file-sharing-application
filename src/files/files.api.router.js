const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads" });

const insertFileApi = require("./insertFile.api");
const renameFileApi = require("./renameFile.api");
const getFileApi = require("./getFile.api");
const searchFileApi = require("./searchFile.api");

const router = express.Router();

router.post("/", upload.single("file"), insertFileApi);
router.post("/rename", renameFileApi);
router.get("/file", getFileApi);
router.get("/", searchFileApi);

module.exports = router;
