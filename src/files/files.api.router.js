const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads" });

const insertFileApi = require("./insertFile.api");
const renameFileApi = require("./renameFile.api");
const getFileApi = require("./getFile.api");
const searchFileApi = require("./searchFile.api");
const shareFileApi = require("./shareFile.api");
const getFileByLinkApi = require("./getFile.byLink.api")
const deleteFileApi = require("./deleteFile.api");
const deleteFileLinkApi = require("./deleteFileLink.api");

const router = express.Router();

router.post("/", upload.single("file"), insertFileApi);
router.get("/by-token", getFileByLinkApi);
router.put("/:fileId", renameFileApi);
router.get("/:fileId", getFileApi);
router.post("/", searchFileApi);
router.put("/:fileId/share", shareFileApi);
router.delete("/:fileId", deleteFileApi);
router.put("/:fileId/deleteLink", deleteFileLinkApi);

module.exports = router;
