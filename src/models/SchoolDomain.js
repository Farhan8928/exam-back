const mongoose = require("mongoose");

const schoolDomainSchema = new mongoose.Schema({
  domain: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SchoolDomain", schoolDomainSchema);
