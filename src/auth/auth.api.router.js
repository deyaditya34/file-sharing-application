const express = require("express");

const router = express.Router();

const registerUserApi = require("./auth.register.api");
const loginUserApi = require("./auth.login.api");
const adminLoginUserApi = require("./auth.adminLogin.api")
const adminRegisterUserApi = require("./auth.adminRegister.api");

router.post("/register", registerUserApi);
router.post("/login", loginUserApi);
router.post("/admin/register", adminRegisterUserApi);
router.post("/admin/login", adminLoginUserApi);

module.exports = router;