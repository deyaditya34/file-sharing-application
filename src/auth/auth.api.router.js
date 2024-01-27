const express = require("express");

const router = express.Router();

const registerUserApi = require("./auth.register.api");
const loginUserApi = require("./auth.login.api");

router.post("/register", registerUserApi);
router.post("/login", loginUserApi);

module.exports = router;