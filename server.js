const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]); // rješava SRV problem u tvojoj mreži (nije iz lekcije)

const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const passUserToView = require("./middleware/pass-user-to-view.js");

const authController = require("./controllers/auth.js");
const institutionsController = require("./controllers/institutions.js"); // NOVO

const port = process.env.PORT ? process.env.PORT : "3000";

mongoose.connect(process.env.MONGODB_URI);

// Privremeno: ukloniti u fazi 7 (rubrika ne dozvoljava console.log)
mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));
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
// Mora ići ispod session middleware-a
app.use(passUserToView);

// GET /
app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.use("/auth", authController);
app.use("/institutions", institutionsController); // NOVO

// 404 mora biti zadnja ruta (Express 5: app.use umjesto app.get("*"))
app.use((req, res) => {
  res.status(404).render("error.ejs", {
    msg: "Stranica nije pronađena.",
  });
});

// Privremeno: ukloniti u fazi 7
const handleServerError = (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`Warning! Port ${port} is already in use!`);
  } else {
    console.log("Error:", err);
  }
};

// Privremeno: ukloniti u fazi 7
app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
}).on("error", handleServerError);
