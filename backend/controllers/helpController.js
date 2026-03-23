import HelpConnection from '../models/HelpConnection.js';
import Request from '../models/Request.js';
import Donation from '../models/Donation.js';
import Chat from '../models/Chat.js';
import Notification from '../models/Notification.js';

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

        // Reuse existing chat if already created (prevents duplicate chat rooms)
        let savedChat = await Chat.findOne({
            requestId,
            helperId: req.user._id,
            needyUserId: request.createdBy,
        });

        if (!savedChat) {
            const chat = new Chat({
                requestId,
                helperId: req.user._id,
                needyUserId: request.createdBy,
            });
            savedChat = await chat.save();
        }

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

// @desc    Claim / request a donation item (needy user → donor chat)
// @route   POST /api/help/claim-donation
// @access  Private
export const claimDonation = async (req, res, next) => {
    try {
        const { donationId } = req.body;

        const donation = await Donation.findById(donationId).populate('createdBy', 'name');
        if (!donation) {
            res.status(404);
            throw new Error('Donation not found');
        }

        if (donation.createdBy._id.toString() === req.user._id.toString()) {
            res.status(400);
            throw new Error('You cannot claim your own donation');
        }

        // Reuse existing chat if the same user already claimed this donation
        let chat = await Chat.findOne({
            donationId,
            helperId: donation.createdBy._id,
            needyUserId: req.user._id,
        });

        const isFirstClaim = !chat;

        if (!chat) {
            chat = new Chat({
                donationId,
                helperId: donation.createdBy._id,
                needyUserId: req.user._id,
            });
            await chat.save();
        }

        // Mark donation as claimed (only once) + advance lifecycle to "requested"
        if (donation.status === 'available') {
            donation.status = 'claimed';
            donation.lifecycleStatus = 'requested';
            donation.requestedBy = req.user._id;
            await donation.save();
        }

        const io = req.app.get('io');

        // --- Notify the DONOR in real time ---
        if (io) {
            io.to(donation.createdBy._id.toString()).emit('donation_claimed', {
                chatId: chat._id,
                message: 'Someone has requested your donation.',
                claimerName: req.user.name,
                itemName: donation.itemName,
            });
        }

        // --- Notify the REQUESTER: persist to DB + emit real-time bell update ---
        if (isFirstClaim) {
            const notifMsg = `Your request has been successfully sent to the donor for "${donation.itemName}".`;
            const notif = await Notification.create({
                user: req.user._id,
                message: notifMsg,
                type: 'request_sent',
                relatedDonation: donation._id,
            });

            if (io) {
                io.to(req.user._id.toString()).emit('new_notification', {
                    _id: notif._id,
                    message: notifMsg,
                    type: 'request_sent',
                    relatedDonation: { _id: donation._id, itemName: donation.itemName },
                    isRead: false,
                    createdAt: notif.createdAt,
                });
            }
        }

        res.status(201).json({
            chatId: chat._id,
            lifecycleStatus: donation.lifecycleStatus,
        });
    } catch (error) {
        next(error);
    }
};
