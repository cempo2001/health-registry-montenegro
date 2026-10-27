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
  // Institution where the professional works (one-to-many)
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
    required: true,
  },
  // User who created the professional
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Professional = mongoose.model("Professional", professionalSchema);

module.exports = Professional;
