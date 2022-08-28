const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let logSchema = new Schema({
  username: String,
  count: Number,
  log: Array,
});

let logModel = mongoose.model("logs", logSchema);
module.exports = logModel;