const express = require("express");
const router = express.Router();

const Institution = require("../models/institution.js");
const Professional = require("../models/professional.js");
const isSignedIn = require("../middleware/is-signed-in.js");

// GET /institutions
router.get("/", async (req, res) => {
  try {
    // populate replaces the owner ID with the actual user document
    const institutions = await Institution.find({}).populate("owner");
    res.render("institutions/index.ejs", {
      institutions: institutions,
    });
  } catch (error) {
    res.status(500).render("error.ejs", {
      msg: "Institutions cannot be displayed right now.",
    });
  }
});

// GET /institutions/new
// Must come BEFORE the route with a parameter, otherwise Express reads "new" as an ID
router.get("/new", isSignedIn, (req, res) => {
  res.render("institutions/new.ejs");
});

// POST /institutions
router.post("/", isSignedIn, async (req, res) => {
  try {
    // The owner comes from the session, never from the form
    req.body.owner = req.session.user._id;
    await Institution.create(req.body);
    res.redirect("/institutions");
  } catch (error) {
    res.status(500).render("error.ejs", {
      msg: "Institution was not saved. Please check the entered data.",
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
        msg: "Institution not found.",
      });
    }

    // Professionals who work at this institution
    const professionals = await Professional.find({
      institution: institution._id,
    });

    res.render("institutions/show.ejs", {
      institution: institution,
      professionals: professionals,
    });
  } catch (error) {
    res.status(500).render("error.ejs", {
      msg: "This institution cannot be displayed right now.",
    });
  }
});

// GET /institutions/:institutionId/edit
router.get("/:institutionId/edit", isSignedIn, async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);

    if (!institution) {
      return res.status(404).render("error.ejs", {
        msg: "Institution not found.",
      });
    }

    // Server-side protection: only the owner may open the edit form
    if (!institution.owner.equals(req.session.user._id)) {
      return res.status(403).render("error.ejs", {
        msg: "You do not have permission to edit this institution.",
      });
    }

    res.render("institutions/edit.ejs", {
      institution: institution,
    });
  } catch (error) {
    res.status(500).render("error.ejs", {
      msg: "The edit form cannot be displayed right now.",
    });
  }
});

// PUT /institutions/:institutionId
router.put("/:institutionId", isSignedIn, async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);

    if (!institution) {
      return res.status(404).render("error.ejs", {
        msg: "Institution not found.",
      });
    }

    if (!institution.owner.equals(req.session.user._id)) {
      return res.status(403).render("error.ejs", {
        msg: "You do not have permission to edit this institution.",
      });
    }

    // The owner cannot be changed through the form or a hand-crafted request
    delete req.body.owner;

    await institution.updateOne(req.body);
    res.redirect(`/institutions/${req.params.institutionId}`);
  } catch (error) {
    res.status(500).render("error.ejs", {
      msg: "Changes were not saved. Please check the entered data.",
    });
  }
});

// DELETE /institutions/:institutionId
router.delete("/:institutionId", isSignedIn, async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);

    if (!institution) {
      return res.status(404).render("error.ejs", {
        msg: "Institution not found.",
      });
    }

    if (!institution.owner.equals(req.session.user._id)) {
      return res.status(403).render("error.ejs", {
        msg: "You do not have permission to delete this institution.",
      });
    }

    await institution.deleteOne();
    res.redirect("/institutions");
  } catch (error) {
    res.status(500).render("error.ejs", {
      msg: "Institution was not deleted. Please try again.",
    });
  }
});

// GET /institutions/:institutionId/professionals/new
router.get("/:institutionId/professionals/new", isSignedIn, async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);

    if (!institution) {
      return res.status(404).render("error.ejs", {
        msg: "Institution not found.",
      });
    }

    if (!institution.owner.equals(req.session.user._id)) {
      return res.status(403).render("error.ejs", {
        msg: "You do not have permission to add professionals to this institution.",
      });
    }

    res.render("professionals/new.ejs", {
      institution: institution,
    });
  } catch (error) {
    res.status(500).render("error.ejs", {
      msg: "The form cannot be displayed right now.",
    });
  }
});

// POST /institutions/:institutionId/professionals
router.post("/:institutionId/professionals", isSignedIn, async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);

    if (!institution) {
      return res.status(404).render("error.ejs", {
        msg: "Institution not found.",
      });
    }

    if (!institution.owner.equals(req.session.user._id)) {
      return res.status(403).render("error.ejs", {
        msg: "You do not have permission to add professionals to this institution.",
      });
    }

    // The institution and owner come from the server, never from the form
    req.body.institution = institution._id;
    req.body.owner = req.session.user._id;
    await Professional.create(req.body);
    res.redirect(`/institutions/${institution._id}`);
  } catch (error) {
    res.status(500).render("error.ejs", {
      msg: "Professional was not saved. Please check the entered data.",
    });
  }
});

// GET /institutions/:institutionId/professionals/:professionalId/edit
router.get(
  "/:institutionId/professionals/:professionalId/edit",
  isSignedIn,
  async (req, res) => {
    try {
      const institution = await Institution.findById(req.params.institutionId);
      const professional = await Professional.findById(
        req.params.professionalId
      );

      // The professional must exist and belong to the institution in the URL
      if (
        !institution ||
        !professional ||
        !professional.institution.equals(institution._id)
      ) {
        return res.status(404).render("error.ejs", {
          msg: "Professional not found.",
        });
      }

      if (!institution.owner.equals(req.session.user._id)) {
        return res.status(403).render("error.ejs", {
          msg: "You do not have permission to edit this professional.",
        });
      }

      res.render("professionals/edit.ejs", {
        institution: institution,
        professional: professional,
      });
    } catch (error) {
      res.status(500).render("error.ejs", {
        msg: "The form cannot be displayed right now.",
      });
    }
  }
);

// PUT /institutions/:institutionId/professionals/:professionalId
router.put(
  "/:institutionId/professionals/:professionalId",
  isSignedIn,
  async (req, res) => {
    try {
      const institution = await Institution.findById(req.params.institutionId);
      const professional = await Professional.findById(
        req.params.professionalId
      );

      // The professional must exist and belong to the institution in the URL
      if (
        !institution ||
        !professional ||
        !professional.institution.equals(institution._id)
      ) {
        return res.status(404).render("error.ejs", {
          msg: "Professional not found.",
        });
      }

      if (!institution.owner.equals(req.session.user._id)) {
        return res.status(403).render("error.ejs", {
          msg: "You do not have permission to edit this professional.",
        });
      }

      // The institution and owner cannot be changed through the form
      delete req.body.owner;
      delete req.body.institution;

      await professional.updateOne(req.body);
      res.redirect(`/institutions/${institution._id}`);
    } catch (error) {
      res.status(500).render("error.ejs", {
        msg: "Changes were not saved. Please check the entered data.",
      });
    }
  }
);

// DELETE /institutions/:institutionId/professionals/:professionalId
router.delete(
  "/:institutionId/professionals/:professionalId",
  isSignedIn,
  async (req, res) => {
    try {
      const institution = await Institution.findById(req.params.institutionId);
      const professional = await Professional.findById(
        req.params.professionalId
      );

      // The professional must exist and belong to the institution in the URL
      if (
        !institution ||
        !professional ||
        !professional.institution.equals(institution._id)
      ) {
        return res.status(404).render("error.ejs", {
          msg: "Professional not found.",
        });
      }

      if (!institution.owner.equals(req.session.user._id)) {
        return res.status(403).render("error.ejs", {
          msg: "You do not have permission to delete this professional.",
        });
      }

      await professional.deleteOne();
      res.redirect(`/institutions/${institution._id}`);
    } catch (error) {
      res.status(500).render("error.ejs", {
        msg: "Professional was not deleted. Please try again.",
      });
    }
  }
);

// POST /institutions/:institutionId/favorite
router.post("/:institutionId/favorite", isSignedIn, async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);

    if (!institution) {
      return res.status(404).render("error.ejs", {
        msg: "Institution not found.",
      });
    }

    // The user comes from the session; the check prevents duplicates
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
      msg: "Institution could not be added to favorites.",
    });
  }
});

// DELETE /institutions/:institutionId/favorite
router.delete("/:institutionId/favorite", isSignedIn, async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);

    if (!institution) {
      return res.status(404).render("error.ejs", {
        msg: "Institution not found.",
      });
    }

    await institution.updateOne({
      $pull: { favoritedByUsers: req.session.user._id },
    });

    res.redirect(`/institutions/${institution._id}`);
  } catch (error) {
    res.status(500).render("error.ejs", {
      msg: "Institution could not be removed from favorites.",
    });
  }
});

module.exports = router;
