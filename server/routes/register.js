const express = require("express");
const router = express.Router();
const simpleSession = require("./session");

router.get("/", (request, response) => {
    response.render("register.jade", { user: request.session.user || {} });
});

module.exports = router;
