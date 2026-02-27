const mongoose = require("mongoose");

const versionSchema = new mongoose.Schema({
  code: String,
  savedAt: {
    type: Date,
    default: Date.now
  }
});

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    default: ""
  },
  versions: [versionSchema]
});

module.exports = mongoose.model("Room", roomSchema);