const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const bcrypt = require('bcryptjs');
const db = require("./db");
const User = require("./models/user");
const Event = require("./models/event");

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, 'uploads/'));
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// API Routes
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Signin route
app.post('/api/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        res.json({
            message: 'Sign in successful',
            userId: user._id,
            username: user.username
        });
    } catch (error) {
        console.error('Sign in error:', error);
        res.status(500).json({ message: 'Server error during sign in' });
    }
});

// Signup route
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            email,
            password: hashedPassword
        });
        await user.save();
        res.status(201).json({
            message: 'User created successfully',
            userId: user._id
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during signup' });
    }
});

// Create event route
app.post('/api/createevent', upload.single('eventImage'), async (req, res) => {
    try {
        const eventData = {
            ...req.body,
            image: req.file ? `/uploads/${req.file.filename}` : null
        };
        const event = new Event(eventData);
        await event.save();
        res.status(201).json({
            message: 'Event created successfully',
            eventId: event._id
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ message: 'Server error during event creation' });
    }
});

// Get all events route
app.get('/api/events', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (error) {
        console.error('Fetch events error:', error);
        res.status(500).json({ message: 'Server error while fetching events' });
    }
});

// Register for event route
app.post('/api/register/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        const { userId } = req.body;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.currentAttendees >= event.maxAttendees) {
            return res.status(400).json({ message: 'Event is full' });
        }

        if (event.registeredUsers.includes(userId)) {
            return res.status(400).json({ message: 'User already registered' });
        }

        event.registeredUsers.push(userId);
        event.currentAttendees += 1;
        await event.save();

        res.json({ message: 'Successfully registered for event' });
    } catch (error) {
        console.error('Event registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Delete event route
app.delete('/api/events/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        await Event.findByIdAndDelete(eventId);
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ message: 'Server error during event deletion' });
    }
});

// Static files
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Catch-all route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });
