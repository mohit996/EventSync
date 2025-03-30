const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const db = require("./db");
const User = require("./models/user");
const Event = require("./models/event");

const app = express();
const port = 3001;

// Middleware
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded images
app.use(express.json());

// Configure Multer Storage for Image Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "uploads")); // Ensure this folder exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage });

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ✅ User Signup (Prevent Duplicate Signup)
app.post("/signup", async (req, res) => {
    console.log("Received Signup Request:", req.body); // Debugging

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const newUser = new User({ username, email, password });
        await newUser.save();
        res.status(201).json({ message: "Signup successful", userId: newUser._id });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Signup failed" });
    }
});


// ✅ User Signin
app.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (!existingUser || password !== existingUser.password) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // ✅ Send userId in response
        res.json({ message: "Signin successful", userId: existingUser._id });
    } catch (error) {
        console.error("Signin error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.get("/signin", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/signin.html"));
});

app.get("/createevent", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/createevent.html"));
});

// ✅ Create Event with Image Upload & Max Attendees
app.post("/createevent", upload.single("eventImage"), async (req, res) => {
    try {
        console.log("Received event data:", req.body);
        console.log("Uploaded file details:", req.file);
        const { title, category, date, time, location, description, maxAttendees, createdBy } = req.body;

        const eventData = {
            title,
            category,
            date,
            time,
            location,
            description,
            maxAttendees: parseInt(maxAttendees) || 50, // Default max attendees if missing
            currentAttendees: 0, // Start with zero attendees
            registeredUsers: [], // List of registered user IDs
            image: `/uploads/${req.file.filename}`, // Store image path
            createdBy  
        };

        const newEvent = new Event(eventData);
        await newEvent.save();

        console.log("Event saved successfully!");
        res.json({ message: "Event created successfully", imageUrl: eventData.image });
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ✅ Fetch All Events
app.get("/events", async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ✅ Register for an Event (Prevents Multiple Registrations)
const nodemailer = require("nodemailer");

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: "gmail", // Change if using a different provider
    auth: {
        user: "mohitshekhawat20s@gmail.com", // Replace with your email
        pass: "dxkq ipmn fjtj pclh" // Replace with your email password or app password
    }
});

// Register for an Event & Send Confirmation Email
app.post("/register/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "You must be signed in to register" });
        }

        const event = await Event.findById(id);
        const user = await User.findById(userId);

        if (!event || !user) {
            return res.status(404).json({ success: false, message: "Event or User not found" });
        }

        if (event.registeredUsers.includes(userId)) {
            return res.status(400).json({ success: false, message: "You are already registered for this event" });
        }

        if (event.currentAttendees >= event.maxAttendees) {
            return res.status(400).json({ success: false, message: "Event is full" });
        }

        // Register the user
        event.registeredUsers.push(userId);
        event.currentAttendees += 1;
        await event.save();

        // Send Confirmation Email
        const mailOptions = {
            from: "mohitshekhawat20s@gmail.com", // Sender's email
            to: user.email, // User's email
            subject: "Event Registration Confirmation",
            text: `Hello ${user.username},\n\nYou have successfully registered for the event: ${event.title}.\n\nEvent Details:\nDate: ${event.date}\nTime: ${event.time}\nLocation: ${event.location}\n\nPlease be on time. Looking forward to seeing you there!\n\nBest,\nEventSync Team`
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: "Registered successfully! Confirmation email sent." });
    } catch (error) {
        console.error("Error registering for event:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});




// ✅ DELETE an Event by ID
app.delete("/events/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        await Event.findByIdAndDelete(id);
        res.json({ success: true, message: "Event deleted successfully" });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
