import Notification from '../models/Notification.js';

// @desc    Get my notifications
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .populate('relatedDonation', 'itemName category')
            .sort({ createdAt: -1 })
            .limit(30);
        res.json(notifications);
    } catch (error) {
        next(error);
    }
};

// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });

        if (!notification) {
            res.status(404);
            throw new Error('Notification not found');
        }

        notification.isRead = true;
        await notification.save();
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};
