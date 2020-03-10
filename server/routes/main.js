const express = require("express");
const router = express.Router();
const simpleSession = require("./session");

router.get("/", (request, response) => {
    console.log(request.session);
    response.render("main.jade", { login: request.session.user && request.session.user.login, user: request.session.user || {}, path: request.originalUrl });
});

module.exports = router;
