require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');  // Import bcrypt
const User = require('../models/User');

const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    console.log("Registering user with the following details:");
    console.log("Username:", username);
    console.log("Email:", email);
    console.log("Password (Plaintext):", password);

    if (!username || !email || !password) {
        console.log("Error: Missing required fields");
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("Error: User already exists with this email");
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password using bcrypt.hash 
        const hashedPassword = await bcrypt.hash(password, 10); 
        console.log("Hashed Password:", hashedPassword);

        // Store the hashed password
        const newUser = new User({ username, email, password : hashedPassword });
        await newUser.save();
        console.log("User Registered Successfully:", newUser);
        res.status(201).json({ message: "User Registered Successfully" });

    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Error registering user" });
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    console.log("Logging in with the following credentials:");
    console.log("Email:", email);
    console.log("Password (Plaintext):", password);

    try {
        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            console.log("Error: User not found with the provided email");
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        console.log("User Found:", user);
        const passwordBD = user.password;
        console.log("Stored Hashed Password:", passwordBD);

        // Compare the entered password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, passwordBD);  
        console.log("Password Valid:", isPasswordValid);

        if (!isPasswordValid) {
            console.log("Error: Invalid credentials - Password does not match");
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Generate JWT token 
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log("Generated JWT Token:", token);

        res.json({ token });

    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ message: "Error logging in" });
    }
});

// Logged-In
router.get('/me', require('../middleware/authMiddleware'), async (req, res) => {
    console.log("Fetching user details for logged-in user with ID:", req.user.id);
    try {
        const user = await User.findById(req.user.id).select('-password');
        console.log("Logged-In User:", user);
        res.json(user);
    } catch (error) {
        console.error("Error fetching logged-in user details:", error);
        res.status(500).json({ message: "Error fetching user details" });
    }
});

module.exports = router;
