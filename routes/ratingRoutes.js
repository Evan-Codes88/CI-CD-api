import express from 'express';
import { createRating, getRatingsByInspection, getRatingById, updateRating, deleteRating } from '../controllers/ratingController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, createRating);
router.get('/inspection/:inspection', auth, getRatingsByInspection);
router.get('/:id', auth, getRatingById);
router.put('/:id', auth, updateRating);
router.delete('/:id', auth, deleteRating);

export default router;