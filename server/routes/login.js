const express = require("express");
const router = express.Router();
const simpleSession = require("./session");

router.get("/", (request, response) => {

    response.render("login.jade", { title: "Hey", message: "Hello there!" });
});

module.exports = router;
