const express = require("express");
const router = express.Router();

const Institution = require("../models/institution.js");
const Professional = require("../models/professional.js"); // NOVO
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

    // NOVO: radnici koji rade u ovoj ustanovi
    const professionals = await Professional.find({
      institution: institution._id,
    });

    res.render("institutions/show.ejs", {
      institution: institution,
      professionals: professionals,
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

// PUT /institutions/:institutionId
router.put("/:institutionId", isSignedIn, async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);

    if (!institution) {
      return res.status(404).render("error.ejs", {
        msg: "Ustanova nije pronađena.",
      });
    }

    if (!institution.owner.equals(req.session.user._id)) {
      return res.status(403).render("error.ejs", {
        msg: "Nemate dozvolu da izmijenite ovu ustanovu.",
      });
    }

    // Vlasnik se ne može mijenjati kroz formu, ni ručno poslanim zahtjevom
    delete req.body.owner;

    await institution.updateOne(req.body);
    res.redirect(`/institutions/${req.params.institutionId}`);
  } catch (error) {
    res.status(500).render("error.ejs", {
      msg: "Izmjena nije sačuvana. Provjerite unesene podatke.",
    });
  }
});

// DELETE /institutions/:institutionId
router.delete("/:institutionId", isSignedIn, async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);

    if (!institution) {
      return res.status(404).render("error.ejs", {
        msg: "Ustanova nije pronađena.",
      });
    }

    if (!institution.owner.equals(req.session.user._id)) {
      return res.status(403).render("error.ejs", {
        msg: "Nemate dozvolu da obrišete ovu ustanovu.",
      });
    }

    await institution.deleteOne();
    res.redirect("/institutions");
  } catch (error) {
    res.status(500).render("error.ejs", {
      msg: "Ustanova nije obrisana. Pokušajte ponovo.",
    });
  }
});

// NOVO: GET /institutions/:institutionId/professionals/new
router.get("/:institutionId/professionals/new", isSignedIn, async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);

    if (!institution) {
      return res.status(404).render("error.ejs", {
        msg: "Ustanova nije pronađena.",
      });
    }

    if (!institution.owner.equals(req.session.user._id)) {
      return res.status(403).render("error.ejs", {
        msg: "Nemate dozvolu da dodajete radnike u ovu ustanovu.",
      });
    }

    res.render("professionals/new.ejs", {
      institution: institution,
    });
  } catch (error) {
    res.status(500).render("error.ejs", {
      msg: "Formu trenutno nije moguće prikazati.",
    });
  }
});

// NOVO: POST /institutions/:institutionId/professionals
router.post("/:institutionId/professionals", isSignedIn, async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);

    if (!institution) {
      return res.status(404).render("error.ejs", {
        msg: "Ustanova nije pronađena.",
      });
    }

    if (!institution.owner.equals(req.session.user._id)) {
      return res.status(403).render("error.ejs", {
        msg: "Nemate dozvolu da dodajete radnike u ovu ustanovu.",
      });
    }

    // Ustanova i vlasnik se uzimaju sa servera, nikad iz forme
    req.body.institution = institution._id;
    req.body.owner = req.session.user._id;
    await Professional.create(req.body);
    res.redirect(`/institutions/${institution._id}`);
  } catch (error) {
    res.status(500).render("error.ejs", {
      msg: "Radnik nije sačuvan. Provjerite unesene podatke.",
    });
  }
});

// NOVO: GET /institutions/:institutionId/professionals/:professionalId/edit
router.get(
  "/:institutionId/professionals/:professionalId/edit",
  isSignedIn,
  async (req, res) => {
    try {
      const institution = await Institution.findById(req.params.institutionId);
      const professional = await Professional.findById(
        req.params.professionalId
      );

      // Radnik mora postojati i pripadati ustanovi iz adrese
      if (
        !institution ||
        !professional ||
        !professional.institution.equals(institution._id)
      ) {
        return res.status(404).render("error.ejs", {
          msg: "Radnik nije pronađen.",
        });
      }

      if (!institution.owner.equals(req.session.user._id)) {
        return res.status(403).render("error.ejs", {
          msg: "Nemate dozvolu da izmijenite ovog radnika.",
        });
      }

      res.render("professionals/edit.ejs", {
        institution: institution,
        professional: professional,
      });
    } catch (error) {
      res.status(500).render("error.ejs", {
        msg: "Formu trenutno nije moguće prikazati.",
      });
    }
  }
);

// NOVO: PUT /institutions/:institutionId/professionals/:professionalId
router.put(
  "/:institutionId/professionals/:professionalId",
  isSignedIn,
  async (req, res) => {
    try {
      const institution = await Institution.findById(req.params.institutionId);
      const professional = await Professional.findById(
        req.params.professionalId
      );

      // Radnik mora postojati i pripadati ustanovi iz adrese
      if (
        !institution ||
        !professional ||
        !professional.institution.equals(institution._id)
      ) {
        return res.status(404).render("error.ejs", {
          msg: "Radnik nije pronađen.",
        });
      }

      if (!institution.owner.equals(req.session.user._id)) {
        return res.status(403).render("error.ejs", {
          msg: "Nemate dozvolu da izmijenite ovog radnika.",
        });
      }

      // Ustanova i vlasnik se ne mogu mijenjati kroz formu
      delete req.body.owner;
      delete req.body.institution;

      await professional.updateOne(req.body);
      res.redirect(`/institutions/${institution._id}`);
    } catch (error) {
      res.status(500).render("error.ejs", {
        msg: "Izmjena nije sačuvana. Provjerite unesene podatke.",
      });
    }
  }
);

// NOVO: DELETE /institutions/:institutionId/professionals/:professionalId
router.delete(
  "/:institutionId/professionals/:professionalId",
  isSignedIn,
  async (req, res) => {
    try {
      const institution = await Institution.findById(req.params.institutionId);
      const professional = await Professional.findById(
        req.params.professionalId
      );

      // Radnik mora postojati i pripadati ustanovi iz adrese
      if (
        !institution ||
        !professional ||
        !professional.institution.equals(institution._id)
      ) {
        return res.status(404).render("error.ejs", {
          msg: "Radnik nije pronađen.",
        });
      }

      if (!institution.owner.equals(req.session.user._id)) {
        return res.status(403).render("error.ejs", {
          msg: "Nemate dozvolu da obrišete ovog radnika.",
        });
      }

      await professional.deleteOne();
      res.redirect(`/institutions/${institution._id}`);
    } catch (error) {
      res.status(500).render("error.ejs", {
        msg: "Radnik nije obrisan. Pokušajte ponovo.",
      });
    }
  }
);

// NOVO: POST /institutions/:institutionId/favorite
router.post("/:institutionId/favorite", isSignedIn, async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);

    if (!institution) {
      return res.status(404).render("error.ejs", {
        msg: "Ustanova nije pronađena.",
      });
    }

    // Korisnik se uzima iz sesije; provjera sprječava dupliranje
    const userId = req.session.user._id;
    const alreadyFavorited = institution.favoritedByUsers.some((id) =>
      id.equals(userId)
    );

    if (!alreadyFavorited) {
      await institution.updateOne({ $push: { favoritedByUsers: userId } });
    }

    res.redirect(`/institutions/${institution._id}`);
  } catch (error) {
    res.status(500).render("error.ejs", {
      msg: "Ustanova nije dodata u omiljene.",
    });
  }
});

// NOVO: DELETE /institutions/:institutionId/favorite
router.delete("/:institutionId/favorite", isSignedIn, async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);

    if (!institution) {
      return res.status(404).render("error.ejs", {
        msg: "Ustanova nije pronađena.",
      });
    }

    await institution.updateOne({
      $pull: { favoritedByUsers: req.session.user._id },
    });

    res.redirect(`/institutions/${institution._id}`);
  } catch (error) {
    res.status(500).render("error.ejs", {
      msg: "Ustanova nije uklonjena iz omiljenih.",
    });
  }
});

module.exports = router;
