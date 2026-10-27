const mongoose = require("mongoose");

const professionalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  profession: {
    type: String,
    required: true,
  },
  specialty: {
    type: String,
  },
  // Ustanova u kojoj radnik radi (jedan-prema-više)
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
    required: true,
  },
  // Korisnik koji je unio radnika
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Professional = mongoose.model("Professional", professionalSchema);

module.exports = Professional;
