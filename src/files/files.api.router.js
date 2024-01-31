const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads" });

const insertFileApi = require("./insertFile.api");
const renameFileApi = require("./renameFile.api");
const getFileApi = require("./getFile.api");
const searchFileApi = require("./searchFile.api");
const shareFileApi = require("./shareFile.api");
const accessFileApi = require("./accessFile.api");
const shareFileUserApi = require("./shareFileUser.api");
const deleteFileApi = require("./deleteFile.api");

const router = express.Router();

router.post("/", upload.single("file"), insertFileApi);
router.post("/rename", renameFileApi);
router.get("/file", getFileApi);
router.get("/", searchFileApi);
router.get("/share/:id", shareFileApi);
router.get("/access", accessFileApi);
router.get("/shareUser", shareFileUserApi)
router.delete("/", deleteFileApi)

module.exports = router;
