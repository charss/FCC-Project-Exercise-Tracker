const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let exerciseSchema = new Schema({
  username: String,
  description: String,
  duration: Number,
  date: { type: Date, default: Date.now },
});

let exerciseModel = mongoose.model("exercises", exerciseSchema);
module.exports = exerciseModel;
