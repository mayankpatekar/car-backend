// models/car.js
import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  model: { type: String, required: true },
  make: { type: String, required: true },
  price: { type: Number, required: true },
  type: { type: String, enum: ['suv', 'economy', 'luxury'], required: true },
  image: { type: String, required: true },
});

const Car = mongoose.model('Car', carSchema);

export default Car;
