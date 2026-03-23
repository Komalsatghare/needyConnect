// @desc    Admin-only middleware
// Checks that the logged-in user has role === 'admin'
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403);
        const err = new Error('Not authorized as admin');
        next(err);
    }
};
