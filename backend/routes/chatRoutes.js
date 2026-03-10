import express from 'express';
import { getMyChats, getChatById, getMessages, sendMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Must be before /:chatId to avoid route conflict
router.route('/my-chats').get(protect, getMyChats);

router.route('/:chatId').get(protect, getChatById);
router.route('/:chatId/messages').get(protect, getMessages);
router.route('/:chatId/send').post(protect, sendMessage);

export default router;
