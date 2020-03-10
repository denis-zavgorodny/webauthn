const express       = require('express');
const bodyParser    = require('body-parser');
const cors = require('cors')
const cookieSession = require('cookie-session');
const cookieParser  = require('cookie-parser');
const urllib        = require('url');
const path          = require('path');
const crypto        = require('crypto');

const config        = require('./config.json');
const webuathnauth  = require('./routes/webauthn.js');
const login = require("./routes/login.js");
const register = require("./routes/register.js");
const logout = require("./routes/logout.js");
const main = require("./routes/main.js");
const profile = require("./routes/profile.js");

const app           = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(bodyParser.json());

/* ----- session ----- */
app.use(cookieSession({
  name: 'session',
  keys: [crypto.randomBytes(32).toString('hex')],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use(cookieParser())

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/* ----- serve static ----- */
app.use(express.static(path.join(__dirname, 'static')));

app.use('/webauthn', webuathnauth);

app.use("/login", login);
app.use("/register", register);
app.use("/logout", logout);
app.use("/profile", profile);
app.use("/", main);

const port = config.port || 3000;
app.listen(port);
console.log(`Started app on port ${port}`);

module.exports = app;
