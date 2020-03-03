const express = require("express");
const router = express.Router();
const simpleSession = require("./session");

router.get("/", (request, response) => {
    request.session.user = {};
    response.redirect(301, "/");
});

module.exports = router;
