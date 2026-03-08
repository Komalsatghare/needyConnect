import Donation from '../models/Donation.js';

// @desc    Create a new donation
// @route   POST /api/donations/create
// @access  Private
export const createDonation = async (req, res, next) => {
    try {
        const { itemName, description, category, quantity, location, image } = req.body;

        const donation = new Donation({
            itemName,
            description,
            category,
            quantity,
            location,
            image,
            createdBy: req.user._id,
        });

        const createdDonation = await donation.save();
        res.status(201).json(createdDonation);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all donations
// @route   GET /api/donations
// @access  Public
export const getDonations = async (req, res, next) => {
    try {
        const donations = await Donation.find({}).populate('createdBy', 'name email phone');
        res.json(donations);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single donation by ID
// @route   GET /api/donations/:id
// @access  Public
export const getDonationById = async (req, res, next) => {
    try {
        const donation = await Donation.findById(req.params.id).populate('createdBy', 'name email phone');

        if (donation) {
            res.json(donation);
        } else {
            res.status(404);
            throw new Error('Donation not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a donation
// @route   DELETE /api/donations/delete/:id
// @access  Private
export const deleteDonation = async (req, res, next) => {
    try {
        const donation = await Donation.findById(req.params.id);

        if (donation) {
            if (donation.createdBy.toString() !== req.user._id.toString()) {
                res.status(401);
                throw new Error('Not authorized to delete this donation');
            }

            await donation.deleteOne();
            res.json({ message: 'Donation removed' });
        } else {
            res.status(404);
            throw new Error('Donation not found');
        }
    } catch (error) {
        next(error);
    }
};
