const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = new Schema({
  username: String,
});

let userModel = mongoose.model("users", userSchema);
module.exports = userModel;