// models/User.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: "/placeholder-avatar.jpg",
  },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }], // Reference to Post model
});

module.exports = mongoose.model("SocialUser", userSchema);
