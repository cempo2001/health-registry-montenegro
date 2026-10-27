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
  // Reference to the user who created the institution (one-to-many)
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  // Users who marked the institution as a favorite (many-to-many)
  favoritedByUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const Institution = mongoose.model("Institution", institutionSchema);

module.exports = Institution;
