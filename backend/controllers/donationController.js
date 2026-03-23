import Donation from '../models/Donation.js';
import Request from '../models/Request.js';
import Notification from '../models/Notification.js';

// Helper: calculate distance in km between two [lng, lat] pairs
function haversineDistance([lng1, lat1], [lng2, lat2]) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// @desc    Create a new donation
// @route   POST /api/donations/create
// @access  Private
export const createDonation = async (req, res, next) => {
    try {
        const { itemName, description, category, quantity, location, image, coordinates } = req.body;

        const donationData = {
            itemName,
            description,
            category,
            quantity,
            location,
            image,
            createdBy: req.user._id,
        };

        // Store geolocation if provided
        if (coordinates && coordinates.length === 2) {
            donationData.coordinates = {
                type: 'Point',
                coordinates: [coordinates[0], coordinates[1]],
            };
        }

        const donation = new Donation(donationData);
        const createdDonation = await donation.save();

        // --- Location-aware notifications ---
        // Find users who have active requests in the same category within 10km radius
        if (donationData.coordinates) {
            const NOTIFY_RADIUS_KM = 10;
            const EARTH_RADIUS_KM = 6371;

            const nearbyRequests = await Request.find({
                category,
                status: 'pending',
                createdBy: { $ne: req.user._id },
                coordinates: {
                    $geoWithin: {
                        $centerSphere: [
                            donationData.coordinates.coordinates,
                            NOTIFY_RADIUS_KM / EARTH_RADIUS_KM,
                        ],
                    },
                },
            }).populate('createdBy', '_id');

            const io = req.app.get('io');
            const notifiedUsers = new Set();

            for (const request of nearbyRequests) {
                const userId = request.createdBy._id.toString();
                if (notifiedUsers.has(userId)) continue;
                notifiedUsers.add(userId);

                const distance = haversineDistance(
                    donationData.coordinates.coordinates,
                    request.coordinates.coordinates
                ).toFixed(1);

                const notifMsg = `A new "${category}" donation is available ${distance} km away: "${itemName}"`;

                // Persist notification to DB
                const notif = await Notification.create({
                    user: request.createdBy._id,
                    message: notifMsg,
                    type: 'nearby_donation',
                    relatedDonation: createdDonation._id,
                    distance: parseFloat(distance),
                });

                // Emit real-time socket event
                if (io) {
                    io.to(userId).emit('new_notification', {
                        _id: notif._id,
                        message: notifMsg,
                        type: 'nearby_donation',
                        distance: parseFloat(distance),
                        relatedDonation: { _id: createdDonation._id, itemName, category },
                        isRead: false,
                        createdAt: notif.createdAt,
                    });
                }
            }
        }

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
        const donations = await Donation.find({}).populate(
            'createdBy',
            'name email phone isVerified trustScore completedDonations'
        );
        res.json(donations);
    } catch (error) {
        next(error);
    }
};

// @desc    Get nearby donations
// @route   GET /api/donations/nearby?lat={lat}&lng={lng}&radius={km}
// @access  Public
export const getNearbyDonations = async (req, res, next) => {
    try {
        const { lat, lng, radius = 10 } = req.query;

        if (!lat || !lng) {
            res.status(400);
            throw new Error('lat and lng query parameters are required');
        }

        const EARTH_RADIUS_KM = 6371;

        const donations = await Donation.find({
            lifecycleStatus: 'posted',
            coordinates: {
                $geoWithin: {
                    $centerSphere: [
                        [parseFloat(lng), parseFloat(lat)],
                        parseFloat(radius) / EARTH_RADIUS_KM,
                    ],
                },
            },
        }).populate('createdBy', 'name isVerified trustScore');

        // Attach distance to each donation
        const withDistance = donations.map((d) => {
            const obj = d.toObject();
            if (d.coordinates && d.coordinates.coordinates) {
                obj.distance = haversineDistance(
                    [parseFloat(lng), parseFloat(lat)],
                    d.coordinates.coordinates
                ).toFixed(1);
            }
            return obj;
        });

        // Sort by distance
        withDistance.sort((a, b) => parseFloat(a.distance || 999) - parseFloat(b.distance || 999));

        res.json(withDistance);
    } catch (error) {
        next(error);
    }
};

// @desc    Get donations created by the logged-in user
// @route   GET /api/donations/my
// @access  Private
export const getMyDonations = async (req, res, next) => {
    try {
        const donations = await Donation.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
        res.json(donations);
    } catch (error) {
        next(error);
    }
};

// @desc    Get donations claimed/requested by the logged-in user (as a receiver)
// @route   GET /api/donations/my-claims
// @access  Private
export const getMyClaimedDonations = async (req, res, next) => {
    try {
        const donations = await Donation.find({ requestedBy: req.user._id })
            .populate('createdBy', 'name email phone isVerified trustScore')
            .sort({ updatedAt: -1 });
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
        const donation = await Donation.findById(req.params.id).populate(
            'createdBy',
            'name email phone isVerified trustScore completedDonations averageRating'
        ).populate('requestedBy', 'name email');

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

// @desc    Update a donation
// @route   PUT /api/donations/update/:id
// @access  Private
export const updateDonation = async (req, res, next) => {
    try {
        const { itemName, description, category, quantity, location, image, coordinates } = req.body;
        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            res.status(404);
            throw new Error('Donation not found');
        }

        if (donation.createdBy.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to update this donation');
        }

        donation.itemName = itemName || donation.itemName;
        donation.description = description || donation.description;
        donation.category = category || donation.category;
        donation.quantity = quantity !== undefined ? Number(quantity) : donation.quantity;
        donation.location = location || donation.location;
        donation.image = image !== undefined ? image : donation.image;

        if (coordinates && coordinates.length === 2) {
            donation.coordinates = { type: 'Point', coordinates };
        }

        const updated = await donation.save();
        res.json(updated);
    } catch (error) {
        next(error);
    }
};

// @desc    Update donation lifecycle status
// @route   PATCH /api/donations/:id/status
// @access  Private
export const updateDonationStatus = async (req, res, next) => {
    try {
        const { lifecycleStatus } = req.body;
        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            res.status(404);
            throw new Error('Donation not found');
        }

        const allowedStatuses = ['posted', 'requested', 'accepted', 'delivered', 'completed'];
        if (!allowedStatuses.includes(lifecycleStatus)) {
            res.status(400);
            throw new Error('Invalid lifecycle status');
        }

        // Only donor or requester can advance the status
        const isDonor = donation.createdBy.toString() === req.user._id.toString();
        const isRequester = donation.requestedBy && donation.requestedBy.toString() === req.user._id.toString();

        if (!isDonor && !isRequester) {
            res.status(401);
            throw new Error('Not authorized to update this donation status');
        }

        // If someone is requesting, record who
        if (lifecycleStatus === 'requested' && !donation.requestedBy) {
            donation.requestedBy = req.user._id;
        }

        donation.lifecycleStatus = lifecycleStatus;

        // If completed, update donor's trust score
        if (lifecycleStatus === 'completed') {
            const User = (await import('../models/User.js')).default;
            const donor = await User.findById(donation.createdBy);
            if (donor) {
                donor.completedDonations += 1;
                donor.trustScore = Math.min(100, donor.trustScore + 5);
                await donor.save();
            }
        }

        const updated = await donation.save();
        res.json(updated);
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
