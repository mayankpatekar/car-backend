// Import necessary modules
import express from 'express';
const router = express.Router();
import Booking from '../models/booking.js'; // Assuming you have a Booking model defined
import nodemailer from 'nodemailer';

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

// POST endpoint to handle booking creation
router.post('/api/bookings', async (req, res) => {
  const {
    userInfo,
    searchCriteria,
    selectedCars,
    pickupLocation,
    dropoffLocation,
    distance,
    contactName,
    contactNo,
    contactEmail,
    totalPrice,
    chauffeurSelected,
    breakdown,
    bookingDateTime
  } = req.body;

  try {
    // Create a new booking document
    const newBooking = new Booking({
      userInfo: userInfo._id, // Assuming userInfo is an object with _id field
      searchCriteria,
      selectedCars,
      pickupLocation: {
        coordinates: pickupLocation.coordinates,
        address: pickupLocation.address
      },
      dropoffLocation: {
        coordinates: dropoffLocation.coordinates,
        address: dropoffLocation.address
      },
      distance,
      contactName,
      contactNo,
      contactEmail,
      totalPrice,
      chauffeurSelected,
      breakdown,
      bookingDateTime
    });

    // Save the booking to the database
    await newBooking.save();

    // Prepare email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: contactEmail,
      subject: 'Booking Confirmation',
      html: `
        <h1>Booking Confirmation</h1>
        <p>Dear ${contactName},</p>
        <p>Your booking has been confirmed successfully.</p>
        <h2>Booking Summary</h2>
        <p><strong>Pickup Location:</strong> ${pickupLocation.address}</p>
        <p><strong>Dropoff Location:</strong> ${dropoffLocation.address}</p>
        <p><strong>Total Distance:</strong> ${distance} km</p>
        <p><strong>Total Price:</strong> $${totalPrice.toFixed(2)}</p>
        <p>Thank you for choosing our service.</p>
      `,
    };

    // Send email
    // await transporter.sendMail(mailOptions);
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
    // Respond with a success message
    res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
  } catch (err) {
    // Handle errors
    console.error('Error creating booking:', err);
    if (err.code === 'EDNS') {
        // Handle DNS resolution timeout
        res.status(500).json({ message: 'DNS resolution timeout: Unable to connect to localhost' });
      } else {
        // Handle other errors
        res.status(500).json({ message: 'Failed to create booking and send confirmation email', error: err.message });
      }
    // res.status(500).json({ message: 'Failed to create booking', error: err.message });
  }
});

// Assuming you have a router setup in your backend
router.get('/api/bookings/user/:userId', async (req, res) => {
    const userId = req.params.userId;
  
    try {
      // Fetch bookings matching the user ID from the database
      const bookings = await Booking.find({ userInfo: userId }).populate('userInfo');
  
      res.status(200).json({ bookings });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
    }
  });
  

export default router;
