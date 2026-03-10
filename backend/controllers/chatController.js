import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

// Helper to safely extract string id from a populated or raw ObjectId field
const toStr = (field) => (field?._id || field)?.toString();

// @desc    Get all chats for the logged-in user
// @route   GET /api/chat/my-chats
// @access  Private
export const getMyChats = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const chats = await Chat.find({
            $or: [{ helperId: userId }, { needyUserId: userId }],
        })
            .populate('helperId', 'name email')
            .populate('needyUserId', 'name email')
            .populate('requestId', 'title status')
            .sort({ updatedAt: -1 });

        // Attach the last message to each chat for preview
        const chatsWithLastMsg = await Promise.all(
            chats.map(async (chat) => {
                const lastMessage = await Message.findOne({ chatId: chat._id })
                    .sort({ createdAt: -1 })
                    .select('content createdAt senderId');
                return { ...chat.toObject(), lastMessage };
            })
        );

        res.json(chatsWithLastMsg);
    } catch (error) {
        next(error);
    }
};

// @desc    Get chat by ID (validates participant access)
// @route   GET /api/chat/:chatId
// @access  Private
export const getChatById = async (req, res, next) => {
    try {
        const chat = await Chat.findById(req.params.chatId)
            .populate('helperId', 'name email')
            .populate('needyUserId', 'name email')
            .populate('requestId', 'title');

        if (!chat) {
            res.status(404);
            throw new Error('Chat not found');
        }

        const userId = req.user._id.toString();
        const isParticipant =
            toStr(chat.helperId) === userId ||
            toStr(chat.needyUserId) === userId;

        if (!isParticipant) {
            res.status(403);
            throw new Error('Access denied: you are not a participant of this chat');
        }

        res.json(chat);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all messages for a chat
// @route   GET /api/chat/:chatId/messages
// @access  Private
export const getMessages = async (req, res, next) => {
    try {
        const chat = await Chat.findById(req.params.chatId);

        if (!chat) {
            res.status(404);
            throw new Error('Chat not found');
        }

        const userId = req.user._id.toString();
        const isParticipant =
            toStr(chat.helperId) === userId ||
            toStr(chat.needyUserId) === userId;

        if (!isParticipant) {
            res.status(403);
            throw new Error('Access denied');
        }

        const messages = await Message.find({ chatId: req.params.chatId })
            .populate('senderId', 'name')
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        next(error);
    }
};

// @desc    Send a message in a chat
// @route   POST /api/chat/:chatId/send
// @access  Private
export const sendMessage = async (req, res, next) => {
    try {
        const { content } = req.body;

        if (!content || !content.trim()) {
            res.status(400);
            throw new Error('Message content is required');
        }

        const chat = await Chat.findById(req.params.chatId);

        if (!chat) {
            res.status(404);
            throw new Error('Chat not found');
        }

        const userId = req.user._id.toString();
        const isParticipant =
            toStr(chat.helperId) === userId ||
            toStr(chat.needyUserId) === userId;

        if (!isParticipant) {
            res.status(403);
            throw new Error('Access denied');
        }

        const message = new Message({
            chatId: req.params.chatId,
            senderId: req.user._id,
            content: content.trim(),
        });

        const savedMessage = await message.save();
        const populated = await savedMessage.populate('senderId', 'name');

        // Emit real-time message via Socket.io (attached to req.app)
        const io = req.app.get('io');
        if (io) {
            io.to(req.params.chatId).emit('new_message', populated);
        }

        res.status(201).json(populated);
    } catch (error) {
        next(error);
    }
};
