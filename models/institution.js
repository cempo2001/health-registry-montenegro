const mongoose = require("mongoose");

const institutionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sector: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  // Referenca na korisnika koji je unio ustanovu (jedan-prema-više)
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Institution = mongoose.model("Institution", institutionSchema);

module.exports = Institution;
