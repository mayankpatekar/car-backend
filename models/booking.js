// Import necessary modules
import mongoose from 'mongoose';

// Define schema for Booking
const bookingSchema = new mongoose.Schema({
  userInfo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  searchCriteria: {
    carType: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  },
  selectedCars: [
    {
      car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
      quantity: { type: Number, default: 1 }
    }
  ],
  pickupLocation: {
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    address: { type: String, required: true }
  },
  dropoffLocation: {
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    address: { type: String, required: true }
  },
  distance: { type: Number }, // Change type to Number to store distance as a number
  contactName: { type: String, required: true },
  contactNo: { type: String, required: true },
  contactEmail: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  chauffeurSelected: { type: Boolean, default: false },
  breakdown: { type: Object },
  bookingDateTime: { type: Date, default: Date.now }
});

// Create and export the Booking model
const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
