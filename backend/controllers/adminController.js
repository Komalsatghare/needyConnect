import User from '../models/User.js';
import Donation from '../models/Donation.js';

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Admin
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        next(error);
    }
};

// @desc    Suspend a user (admin)
// @route   PATCH /api/admin/users/:id/suspend
// @access  Admin
export const suspendUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        user.suspended = true;
        await user.save();
        res.json({ message: 'User suspended' });
    } catch (error) {
        next(error);
    }
};

// @desc    Unsuspend a user (admin)
// @route   PATCH /api/admin/users/:id/unsuspend
// @access  Admin
export const unsuspendUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        user.suspended = false;
        await user.save();
        res.json({ message: 'User unsuspended' });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify a user (admin)
// @route   PATCH /api/admin/users/:id/verify
// @access  Admin
export const verifyUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        user.isVerified = true;
        user.verificationRequested = false;
        // Boost trust score on verification
        user.trustScore = Math.min(100, user.trustScore + 20);
        await user.save();
        res.json({ message: 'User verified' });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete any donation post (admin)
// @route   DELETE /api/admin/donations/:id
// @access  Admin
export const adminDeleteDonation = async (req, res, next) => {
    try {
        const donation = await Donation.findById(req.params.id);
        if (!donation) {
            res.status(404);
            throw new Error('Donation not found');
        }
        await donation.deleteOne();
        res.json({ message: 'Donation removed by admin' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all donations (admin view)
// @route   GET /api/admin/donations
// @access  Admin
export const getAllDonations = async (req, res, next) => {
    try {
        const donations = await Donation.find({})
            .populate('createdBy', 'name email isVerified')
            .sort({ createdAt: -1 });
        res.json(donations);
    } catch (error) {
        next(error);
    }
};
