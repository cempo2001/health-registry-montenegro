const express = require("express");
const router = express.Router();

const Institution = require("../models/institution.js");
const isSignedIn = require("../middleware/is-signed-in.js");

// GET /institutions
router.get("/", async (req, res) => {
  try {
    // populate zamjenjuje ID vlasnika stvarnim dokumentom korisnika
    const institutions = await Institution.find({}).populate("owner");
    res.render("institutions/index.ejs", {
      institutions: institutions,
    });
  } catch (error) {
    res.status(500).render("error.ejs", {
      msg: "Ustanove trenutno nije moguće prikazati.",
    });
  }
});

// GET /institutions/new
// Mora biti PRIJE rute sa parametrom, inače Express "new" čita kao ID
router.get("/new", isSignedIn, (req, res) => {
  res.render("institutions/new.ejs");
});

// POST /institutions
router.post("/", isSignedIn, async (req, res) => {
  try {
    // Vlasnik se uzima iz sesije, nikad iz forme
    req.body.owner = req.session.user._id;
    await Institution.create(req.body);
    res.redirect("/institutions");
  } catch (error) {
    res.status(500).render("error.ejs", {
      msg: "Ustanova nije sačuvana. Provjerite unesene podatke.",
    });
  }
});

// GET /institutions/:institutionId
router.get("/:institutionId", async (req, res) => {
  try {
    const institution = await Institution.findById(
      req.params.institutionId
    ).populate("owner");

    if (!institution) {
      return res.status(404).render("error.ejs", {
        msg: "Ustanova nije pronađena.",
      });
    }

    res.render("institutions/show.ejs", {
      institution: institution,
    });
  } catch (error) {
    res.status(500).render("error.ejs", {
      msg: "Ustanovu trenutno nije moguće prikazati.",
    });
  }
});

// GET /institutions/:institutionId/edit
router.get("/:institutionId/edit", isSignedIn, async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);

    if (!institution) {
      return res.status(404).render("error.ejs", {
        msg: "Ustanova nije pronađena.",
      });
    }

    // Zaštita na serveru: samo vlasnik smije otvoriti formu za izmjenu
    if (!institution.owner.equals(req.session.user._id)) {
      return res.status(403).render("error.ejs", {
        msg: "Nemate dozvolu da izmijenite ovu ustanovu.",
      });
    }

    res.render("institutions/edit.ejs", {
      institution: institution,
    });
  } catch (error) {
    res.status(500).render("error.ejs", {
      msg: "Formu za izmjenu trenutno nije moguće prikazati.",
    });
  }
});

module.exports = router;
