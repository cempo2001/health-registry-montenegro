const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]); // resolves the SRV lookup problem on some networks (not from the lessons)

const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const passUserToView = require("./middleware/pass-user-to-view.js");

const authController = require("./controllers/auth.js");
const institutionsController = require("./controllers/institutions.js");
const usersController = require("./controllers/users.js");

const port = process.env.PORT ? process.env.PORT : "3000";

mongoose.connect(process.env.MONGODB_URI);

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  })
);
// Must go below the session middleware
app.use(passUserToView);

// GET /
app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.use("/auth", authController);
app.use("/institutions", institutionsController);
app.use("/users", usersController);

// The 404 handler must be the last route (Express 5: app.use instead of app.get("*"))
app.use((req, res) => {
  res.status(404).render("error.ejs", {
    msg: "Page not found.",
  });
});

app.listen(port);
