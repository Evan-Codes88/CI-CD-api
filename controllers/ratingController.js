import Rating from '../models/Rating.js';
import mongoose from 'mongoose';

// Create a rating
export const createRating = async (req, res) => {
  const { inspection, rating, comment } = req.body;
  try {
    const newRating = new Rating({
      inspection,
      user: req.user.id,
      rating,
      comment,
    });
    await newRating.save();
    res.status(201).json({ message: 'Rating created', data: newRating });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all ratings for an inspection
export const getRatingsByInspection = async (req, res) => {
  const { inspection } = req.params;
  try {
    const ratings = await Rating.find({ inspection }).populate('user', 'username');
    res.json(ratings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a rating by ID
export const getRatingById = async (req, res) => {
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: 'Invalid rating ID' });
  }

  try {
    const rating = await Rating.findById(id);
    if (!rating) {
      return res.status(404).json({ error: 'Rating not found' });
    }
    return res.status(200).json(rating);
  } catch (err) {
    return res.status(500).json({ error: 'Database error' });
  }
};

// Update a rating
export const updateRating = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  try {
    const existingRating = await Rating.findById(id);
    if (!existingRating) return res.status(404).json({ error: 'Rating not found' });
    if (existingRating.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    existingRating.rating = rating || existingRating.rating;
    existingRating.comment = comment || existingRating.comment;
    await existingRating.save();
    res.json({ message: 'Rating updated', data: existingRating });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a rating
export const deleteRating = async (req, res) => {
  const { id } = req.params;
  try {
    const rating = await Rating.findById(id);
    if (!rating) return res.status(404).json({ error: 'Rating not found' });
    if (rating.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await rating.deleteOne();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};