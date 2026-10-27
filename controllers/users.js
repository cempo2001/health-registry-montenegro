const express = require("express");
const router = express.Router();

const Institution = require("../models/institution.js");
const isSignedIn = require("../middleware/is-signed-in.js");

// GET /users/profile
router.get("/profile", isSignedIn, async (req, res) => {
  try {
    // Ustanove čiji niz omiljenih sadrži ID prijavljenog korisnika
    const favorites = await Institution.find({
      favoritedByUsers: req.session.user._id,
    });

    // Ustanove koje je ovaj korisnik sam unio
    const myInstitutions = await Institution.find({
      owner: req.session.user._id,
    });

    res.render("users/profile.ejs", {
      favorites: favorites,
      myInstitutions: myInstitutions,
    });
  } catch (error) {
    res.status(500).render("error.ejs", {
      msg: "Profil trenutno nije moguće prikazati.",
    });
  }
});

module.exports = router;
