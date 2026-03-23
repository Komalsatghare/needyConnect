import express from 'express';
import {
    acceptHelpRequest,
    getMyHelps,
    claimDonation,
} from '../controllers/helpController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/accept').post(protect, acceptHelpRequest);
router.route('/myhelps').get(protect, getMyHelps);
router.route('/claim-donation').post(protect, claimDonation);

export default router;
