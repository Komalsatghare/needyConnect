import express from 'express';
import {
    createDonation,
    getDonations,
    getNearbyDonations,
    getMyDonations,
    getMyClaimedDonations,
    getDonationById,
    updateDonation,
    updateDonationStatus,
    deleteDonation,
} from '../controllers/donationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Must be before /:id to avoid route conflict
router.route('/nearby').get(getNearbyDonations);
router.route('/my').get(protect, getMyDonations);
router.route('/my-claims').get(protect, getMyClaimedDonations);
router.route('/').get(getDonations);
router.route('/create').post(protect, createDonation);
router.route('/:id').get(getDonationById);
router.route('/update/:id').put(protect, updateDonation);
router.route('/:id/status').patch(protect, updateDonationStatus);
router.route('/delete/:id').delete(protect, deleteDonation);

export default router;

