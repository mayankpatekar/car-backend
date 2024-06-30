import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import carRoutes from './routes/cars.js';
import bookingRoutes from './routes/booking.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use('/cars', carRoutes);
app.use('/booking',bookingRoutes);

const connectWithRetry = () => {
  mongoose.connect(
    process.env.MONGODB_URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
    }
  ).then(() => {
    console.log('Connected to MongoDB');
  }).catch(error => {
    console.error('Error connecting to MongoDB:', error);
    setTimeout(connectWithRetry, 5000);
  });
};

connectWithRetry();

// Initialize Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Define a user schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactNo: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  otp: { type: String },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Utility function to generate OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP via email using Nodemailer
const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP is ${otp}`,
  };

  try {
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err);
        console.log("error");
      } else {
        // console.log(info);
        console.log("info");
      }
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

// Register a new user
app.post('/register', async (req, res) => {
  const { name, contactNo, email } = req.body;

  // Check if user already exists
  try {
    const existingUser = await User.findOne({ contactNo });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate OTP
    const otp = generateOtp();

    // Create a new user
    const user = new User({ name, contactNo, email, otp });
    await user.save();

    // Send OTP to user's email
    await sendOtpEmail(email, otp);
    res.status(201).json({ message: 'User registered successfully. OTP sent to your email.' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Error during registration. Please try again.' });
  }
});

// Step 1: Request OTP
app.post('/request-otp', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Generate OTP
    const otp = generateOtp();

    // Save OTP to the user document
    user.otp = otp;
    await user.save();

    // Send OTP to user's email
    await sendOtpEmail(email, otp);
    res.status(200).json({ message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Error sending OTP. Please try again.' });
  }
});

// Your existing backend code
app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Clear the OTP after successful verification
    user.otp = '';
    await user.save();

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send response
    res.status(200).json({ message: 'Login successful', user, token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Error during login. Please try again.' });
  }
});



// Middleware to protect routes
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Protected route example
app.get('/protected', authenticate, (req, res) => {
  res.status(200).json({ message: 'This is a protected route' });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
