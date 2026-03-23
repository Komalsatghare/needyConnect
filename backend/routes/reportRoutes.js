import express from 'express';
import { createReport, getReports, getMyReports, updateReportStatus } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createReport).get(protect, admin, getReports);
router.route('/my').get(protect, getMyReports);
router.route('/:id/status').patch(protect, admin, updateReportStatus);

export default router;
