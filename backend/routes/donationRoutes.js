import express from 'express';
import {
    createDonation,
    getDonations,
    getDonationById,
    deleteDonation,
} from '../controllers/donationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getDonations);
router.route('/create').post(protect, createDonation);
router.route('/:id').get(getDonationById);
router.route('/delete/:id').delete(protect, deleteDonation);

export default router;
