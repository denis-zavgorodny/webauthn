const express = require("express");
const router = express.Router();
const simpleSession = require("./session");

router.get("/", (request, response) => {
    console.log(request.session);
    response.render("main.jade", { user: request.session.user || {} });
});

module.exports = router;
