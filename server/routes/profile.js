const express = require("express");
const router = express.Router();
const database = require("./db");

router.get("/", (request, response) => {
    if (request.session.user && request.session.user.login) {
        response.render("profile.jade", {
          user: request.session.user || {},
          database,
          path: request.originalUrl
        });
    } else {
        response.redirect(301, "/");
    }
});

module.exports = router;
