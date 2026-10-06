// ====================
// Import Packages
// ====================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

require("dotenv").config();


// ====================
// Create Express App
// ====================

const app = express();


// ====================
// Middleware
// ====================

app.use(cors());
app.use(express.json());


// ====================
// User Schema
// ====================

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
  },
  {
    timestamps: true,
  }
);


// ====================
// User Model
// ====================

const User = mongoose.model("User", userSchema);


// ====================
// Test API
// ====================

app.get("/", (req, res) => {
  res.json({
    message: "API is running",
  });
});


// ====================
// REGISTER API
// ====================

app.post("/api/register", async (req, res) => {
  try {


    
    // Get data from frontend
    const { name, email, password } = req.body;


    // Check whether all fields are entered
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }


    // Check whether email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }


    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);


    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });


    // Send success response
    res.status(201).json({
      message: "Registration successful",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error",
    });

  }
});


// ====================
// LOGIN API
// ====================

app.post("/api/login", async (req, res) => {
  try {

    // Get email and password from frontend
    const { email, password } = req.body;


    // Check whether email and password are entered
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }


    // Find user by email
    const user = await User.findOne({ email });


    // If user does not exist
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }


    // Compare entered password with hashed password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );


    // If password is incorrect
    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }


    // Login successful
    res.status(200).json({
      message: "Login successful",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error",
    });

  }
});


// ====================
// MongoDB Atlas Connection
// ====================

mongoose
  .connect(process.env.MONGO_URI)

  .then(() => {

    console.log("MongoDB Atlas connected successfully");


    // Start server after MongoDB connection
    app.listen(process.env.PORT, () => {

      console.log(
        `Server running on http://localhost:${process.env.PORT}`
      );

    });

  })

  .catch((error) => {

    console.error("MongoDB connection failed:");

    console.error(error.message);

  });