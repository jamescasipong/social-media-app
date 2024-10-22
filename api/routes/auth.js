// routes/auth.js

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../SocialUser");
const Post = require("../Post");
const router = express.Router();

// Middleware to check for a valid token
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Get token from Authorization header
  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user; // Save user info for later use
    next();
  });
};

// Create a new post
// Create a new post
router.post("/posts", authenticateToken, async (req, res) => {
  const { content, image, createdAt, comments, reactions } = req.body;

  const userId = req.user.id;

  const newPost = new Post({
    userId,
    content,
    image,
    createdAt,
    comments,
    reactions,
  });

  try {
    const savedPost = await newPost.save();
    await User.findByIdAndUpdate(userId, { $push: { posts: savedPost._id } });
    res.status(201).json(savedPost);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating post", error: err.message });
  }
});

router.post("/comments/:postId", authenticateToken, async (req, res) => {
  const { content, username } = req.body;
  const postId = req.params.postId;
  const userId = req.user.id;

  try {
    const post = await Post.findByIdAndUpdate(postId, {
      $push: { comments: { userId, username, content, createdAt: new Date() } },
    });

    res.status(201).json(post);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error finding post", error: err.message });
  }
});

// Partially update a post

// Get all posts
router.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find().populate("userId", "username avatar");
    res.json(posts);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching posts", error: err.message });
  }
});

// Register a new user
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({ message: "Email already in use" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    avatar: "/placeholder-avatar.jpg",
  });
  await newUser.save();

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.status(201).json({ id: newUser._id, username, email, token });
});

// Login a user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Incorrect email or password" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({
    id: user._id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    token,
  });
});

// Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude password if needed
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user data", error: error.message });
  }
});

module.exports = router;
