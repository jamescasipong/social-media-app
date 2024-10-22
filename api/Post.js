// models/Post.js

const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SocialUser",
    required: true,
  },
  username: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SocialUser",
    required: true,
  },
  content: { type: String, required: true },
  image: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  comments: [commentSchema], // Array of comments
  reactions: { type: Object, default: {} }, // Store reactions as an object
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
