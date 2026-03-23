import express from 'express';
import {
    registerUser,
    authUser,
    getUserProfile,
    updateUserProfile,
    getUserById,
    requestVerification,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.post('/request-verification', protect, requestVerification);
router.get('/users/:id', getUserById);

export default router;

