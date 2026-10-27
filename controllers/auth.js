const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const User = require("../models/user.js");

// GET /auth/sign-up
router.get("/sign-up", (req, res) => {
  res.render("auth/sign-up.ejs");
});

// GET /auth/sign-in
router.get("/sign-in", (req, res) => {
  res.render("auth/sign-in.ejs");
});

// GET /auth/sign-out
router.get("/sign-out", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// POST /auth/sign-up
router.post("/sign-up", async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (userInDatabase) {
      return res.send("Korisničko ime je već zauzeto.");
    }

    if (req.body.password !== req.body.confirmPassword) {
      return res.send("Lozinka i potvrda lozinke se ne poklapaju.");
    }

    // Lozinku heširamo prije upisa u bazu
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    req.body.password = hashedPassword;

    const user = await User.create(req.body);

    // Automatska prijava poslije registracije
    req.session.user = {
      username: user.username,
      _id: user._id,
    };

    req.session.save(() => {
      res.redirect("/");
    });
  } catch (error) {
    res.status(500).render("error.ejs", {
      msg: "Registracija nije uspjela. Pokušajte ponovo.",
    });
  }
});

// POST /auth/sign-in
router.post("/sign-in", async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (!userInDatabase) {
      return res.send("Prijava nije uspjela. Pokušajte ponovo.");
    }

    const validPassword = bcrypt.compareSync(
      req.body.password,
      userInDatabase.password
    );
    if (!validPassword) {
      return res.send("Prijava nije uspjela. Pokušajte ponovo.");
    }

    // Lozinka se ne čuva u sesiji, ni heširana
    req.session.user = {
      username: userInDatabase.username,
      _id: userInDatabase._id,
    };

    req.session.save(() => {
      res.redirect("/");
    });
  } catch (error) {
    res.status(500).render("error.ejs", {
      msg: "Prijava nije uspjela. Pokušajte ponovo.",
    });
  }
});

module.exports = router;
