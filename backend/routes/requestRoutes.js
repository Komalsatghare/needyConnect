import express from 'express';
import {
    createRequest,
    getRequests,
    getRequestById,
    updateRequest,
    deleteRequest,
    getMyRequests,
} from '../controllers/requestController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getRequests);
router.route('/my').get(protect, getMyRequests);
router.route('/create').post(protect, createRequest);
router.route('/:id').get(getRequestById);
router.route('/update/:id').put(protect, updateRequest);
router.route('/delete/:id').delete(protect, deleteRequest);

export default router;
