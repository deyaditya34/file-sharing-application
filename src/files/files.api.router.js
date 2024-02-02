const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads" });

const insertFileApi = require("./insertFile.api");
const renameFileApi = require("./renameFile.api");
const getFileApi = require("./getFile.api");
const searchFileApi = require("./searchFile.api");
const shareFileApi = require("./shareFile.api");
const getFileByLinkApi = require("./getFile.byLink.api")
const shareFileUserApi = require("./shareFileUser.api");
const deleteFileApi = require("./deleteFile.api");

const router = express.Router();

router.post("/", upload.single("file"), insertFileApi);
router.get("/by-link", getFileByLinkApi);
router.put("/:id", renameFileApi);
router.get("/:id", getFileApi);
router.get("/", searchFileApi);
router.get("/:id/share", shareFileApi);
router.put("/:id/:receiverUsername", shareFileUserApi);
router.delete("/:id", deleteFileApi);

module.exports = router;
