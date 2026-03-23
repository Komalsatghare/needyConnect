import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// Helper to build user response object
const userResponse = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    location: user.location,
    coordinates: user.coordinates,
    isVerified: user.isVerified,
    verificationRequested: user.verificationRequested,
    trustScore: user.trustScore,
    completedDonations: user.completedDonations,
    averageRating: user.averageRating,
    suspended: user.suspended,
    createdAt: user.createdAt,
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
    try {
        const { name, email, phone, password, role, location, coordinates } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const userData = { name, email, phone, password, role, location };

        // Store geolocation if provided
        if (coordinates && coordinates.length === 2) {
            userData.coordinates = {
                type: 'Point',
                coordinates: [coordinates[0], coordinates[1]], // [lng, lat]
            };
        }

        const user = await User.create(userData);

        if (user) {
            res.status(201).json({
                ...userResponse(user),
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && user.suspended) {
            res.status(403);
            throw new Error('Your account has been suspended. Please contact support.');
        }

        if (user && (await user.matchPassword(password))) {
            res.json({
                ...userResponse(user),
                token: generateToken(user._id),
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json(userResponse(user));
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile (name, phone, location, coordinates)
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        const { name, phone, location, coordinates } = req.body;

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (location) user.location = location;

        if (coordinates && coordinates.length === 2) {
            user.coordinates = {
                type: 'Point',
                coordinates: [coordinates[0], coordinates[1]],
            };
        }

        const updated = await user.save();
        res.json({
            ...userResponse(updated),
            token: generateToken(updated._id),
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a public user profile by ID
// @route   GET /api/auth/users/:id
// @access  Public
export const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select(
            'name role location isVerified trustScore completedDonations averageRating createdAt'
        );
        if (user) {
            res.json(user);
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Request verification badge
// @route   POST /api/auth/request-verification
// @access  Private
export const requestVerification = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        user.verificationRequested = true;
        await user.save();
        res.json({ message: 'Verification request submitted. Admin will review soon.' });
    } catch (error) {
        next(error);
    }
};
