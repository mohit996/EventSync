const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const db = require("./db");
const User = require("./models/user");
const Event = require("./models/event");

const app = express();
const port = process.env.PORT || 3001;

// MongoDB connection (local)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/EventSync';

// Update static file serving
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// MongoDB Connection with better error handling
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Successfully connected to MongoDB');
})
.catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running' });
});

// Signin route with better error handling
app.post("/api/signin", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (password !== user.password) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.status(200).json({ 
            message: "Signin successful", 
            userId: user._id 
        });
    } catch (error) {
        console.error("Signin error:", error);
        res.status(500).json({ 
            message: "Internal server error",
            error: error.message 
        });
    }
});

// Signup route with better error handling
app.post("/api/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const user = new User({
            username,
            email,
            password
        });

        await user.save();

        res.status(201).json({ 
            message: "Signup successful", 
            userId: user._id 
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });
    res.status(500).json({ 
        message: "Internal server error", 
        error: err.message 
    });
});

// Export the Express API
module.exports = app;
