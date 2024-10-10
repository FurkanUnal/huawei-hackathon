const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/userdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB", err));

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  surname: String,
  experience: String,
  projects: Array,
});

const User = mongoose.model("User", userSchema);

// User Registration Route
app.post("/register", async (req, res) => {
  const { email, password, name, surname, experience, projects } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create a new user
  const newUser = new User({
    email,
    password: hashedPassword,
    name,
    surname,
    experience,
    projects,
  });
  await newUser.save();

  // Generate a token
  const token = jwt.sign({ userId: newUser._id }, "your_jwt_secret");

  res.status(201).json({ token });
});

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Check if password matches
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Generate token (JWT)
  const token = jwt.sign({ userId: user._id }, "your_jwt_secret");
  res.json({ token });
});

// Fetch mentors route
app.get("/mentors", async (req, res) => {
  try {
    const mentors = await User.find();
    res.json(mentors);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch mentors" });
  }
});

// Update user profile route
app.post("/user/profile", async (req, res) => {
  const { userId, name, surname, experience, projects } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name;
    user.surname = surname;
    user.experience = experience;
    user.projects = projects;

    await user.save();

    res.json({ message: "Profile updated successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile data" });
  }
});

// New Route for Text Generation
app.post("/generate-text", async (req, res) => {
  const { input } = req.body;

  try {
    const API_TOKEN = "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"; // Replace with your Hugging Face API token
    const model = "meta-llama/Llama-3.2-11B-Vision-Instruct"; // Model endpoint

    // Pre-prompt to guide text generation
    const combinedInput = input;

    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      { inputs: combinedInput },
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      }
    );

    res.json({ output: response.data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate text" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
