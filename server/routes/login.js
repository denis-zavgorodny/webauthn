const express = require("express");
const router = express.Router();
const simpleSession = require("./session");

router.get("/", (request, response) => {
    response.header("Pragma", "no-cache");
    response.render("login.jade", { user: request.session.user || {} });
});

module.exports = router;
