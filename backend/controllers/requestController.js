import Request from '../models/Request.js';

// @desc    Create a new request
// @route   POST /api/requests/create
// @access  Private
export const createRequest = async (req, res, next) => {
    try {
        const { title, description, category, location, image } = req.body;

        const request = new Request({
            title,
            description,
            category,
            location,
            image,
            createdBy: req.user._id,
        });

        const createdRequest = await request.save();
        res.status(201).json(createdRequest);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all requests
// @route   GET /api/requests
// @access  Public
export const getRequests = async (req, res, next) => {
    try {
        const requests = await Request.find({}).populate('createdBy', 'name email phone');
        res.json(requests);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single request by ID
// @route   GET /api/requests/:id
// @access  Public
export const getRequestById = async (req, res, next) => {
    try {
        const request = await Request.findById(req.params.id).populate('createdBy', 'name email phone');

        if (request) {
            res.json(request);
        } else {
            res.status(404);
            throw new Error('Request not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update a request
// @route   PUT /api/requests/update/:id
// @access  Private
export const updateRequest = async (req, res, next) => {
    try {
        const { title, description, category, location, image, status } = req.body;

        const request = await Request.findById(req.params.id);

        if (request) {
            if (request.createdBy.toString() !== req.user._id.toString()) {
                res.status(401);
                throw new Error('Not authorized to update this request');
            }

            request.title = title || request.title;
            request.description = description || request.description;
            request.category = category || request.category;
            request.location = location || request.location;
            request.image = image !== undefined ? image : request.image;
            request.status = status || request.status;

            const updatedRequest = await request.save();
            res.json(updatedRequest);
        } else {
            res.status(404);
            throw new Error('Request not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a request
// @route   DELETE /api/requests/delete/:id
// @access  Private
export const deleteRequest = async (req, res, next) => {
    try {
        const request = await Request.findById(req.params.id);

        if (request) {
            if (request.createdBy.toString() !== req.user._id.toString()) {
                res.status(401);
                throw new Error('Not authorized to delete this request');
            }

            await request.deleteOne();
            res.json({ message: 'Request removed' });
        } else {
            res.status(404);
            throw new Error('Request not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get requests created by the logged-in user
// @route   GET /api/requests/my
// @access  Private
export const getMyRequests = async (req, res, next) => {
    try {
        const requests = await Request.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        next(error);
    }
};
