import express from 'express';
import {
    getAllUsers,
    suspendUser,
    unsuspendUser,
    verifyUser,
    adminDeleteDonation,
    getAllDonations,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, admin);

router.route('/users').get(getAllUsers);
router.route('/users/:id/suspend').patch(suspendUser);
router.route('/users/:id/unsuspend').patch(unsuspendUser);
router.route('/users/:id/verify').patch(verifyUser);
router.route('/donations').get(getAllDonations);
router.route('/donations/:id').delete(adminDeleteDonation);

export default router;
