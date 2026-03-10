import HelpConnection from '../models/HelpConnection.js';
import Request from '../models/Request.js';
import Chat from '../models/Chat.js';

// @desc    Accept a help request
// @route   POST /api/help/accept
// @access  Private
export const acceptHelpRequest = async (req, res, next) => {
    try {
        const { requestId } = req.body;

        const request = await Request.findById(requestId);

        if (!request) {
            res.status(404);
            throw new Error('Request not found');
        }

        if (request.createdBy.toString() === req.user._id.toString()) {
            res.status(400);
            throw new Error("You cannot accept your own request");
        }

        const existingConnection = await HelpConnection.findOne({
            requestId,
            helperId: req.user._id,
        });

        if (existingConnection) {
            res.status(400);
            throw new Error('You have already offered help for this request');
        }

        const helpConnection = new HelpConnection({
            requestId,
            helperId: req.user._id,
            needyUserId: request.createdBy,
        });

        await helpConnection.save();

        // Update request status to accepted
        if (request.status === 'pending') {
            request.status = 'accepted';
            await request.save();
        }

        // Create a chat room between the helper and the needy user
        const chat = new Chat({
            requestId,
            helperId: req.user._id,
            needyUserId: request.createdBy,
        });
        const savedChat = await chat.save();

        // Emit real-time notification to the needy user's personal socket room
        const io = req.app.get('io');
        if (io) {
            io.to(request.createdBy.toString()).emit('request_accepted', {
                chatId: savedChat._id,
                message: 'Your request has been accepted.',
                helperName: req.user.name,
                requestTitle: request.title,
            });
        }

        res.status(201).json({
            helpConnection,
            chatId: savedChat._id,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all helps offered by current user
// @route   GET /api/help/myhelps
// @access  Private
export const getMyHelps = async (req, res, next) => {
    try {
        const helps = await HelpConnection.find({ helperId: req.user._id })
            .populate('requestId')
            .populate('needyUserId', 'name email phone');

        res.json(helps);
    } catch (error) {
        next(error);
    }
};
