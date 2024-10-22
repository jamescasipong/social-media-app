// server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Import cors
const authRoutes = require("./routes/auth");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all origins
app.use(cors()); // This will allow all origins

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.use(express.json()); // For parsing application/json
app.use("/api/auth", authRoutes); // Mount your auth routes

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
