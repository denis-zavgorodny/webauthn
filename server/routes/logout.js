const express = require("express");
const router = express.Router();
const simpleSession = require("./session");

router.get("/", (request, response) => {
    request.session.user = {};
    response.header("Pragma", "no-cache");
    response.redirect(301, "/");
});

module.exports = router;
