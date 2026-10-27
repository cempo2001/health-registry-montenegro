const express = require("express");
const router = express.Router();

const Institution = require("../models/institution.js");
const isSignedIn = require("../middleware/is-signed-in.js");

// GET /users/profile
router.get("/profile", isSignedIn, async (req, res) => {
  try {
    // Institutions whose favorites array contains the signed-in user ID
    const favorites = await Institution.find({
      favoritedByUsers: req.session.user._id,
    });

    // Institutions created by this user
    const myInstitutions = await Institution.find({
      owner: req.session.user._id,
    });

    res.render("users/profile.ejs", {
      favorites: favorites,
      myInstitutions: myInstitutions,
    });
  } catch (error) {
    res.status(500).render("error.ejs", {
      msg: "Your profile cannot be displayed right now.",
    });
  }
});

module.exports = router;
