// routes/cars.js
import express from 'express';
import Car from '../models/car.js';

const router = express.Router();

// GET all cars
router.get('/', async (req, res) => {
    try {
      const cars = await Car.find();
      res.json(cars);
    } catch (error) {
      console.error('Error fetching cars:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

export default router;
