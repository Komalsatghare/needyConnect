import Report from '../models/Report.js';

// @desc    Create a report
// @route   POST /api/reports
// @access  Private
export const createReport = async (req, res, next) => {
    try {
        const { reportedUser, donation, reason, description } = req.body;

        if (!reason || !description) {
            res.status(400);
            throw new Error('Reason and description are required');
        }

        const report = await Report.create({
            reporter: req.user._id,
            reportedUser: reportedUser || null,
            donation: donation || null,
            reason,
            description,
        });

        res.status(201).json(report);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all reports (admin only)
// @route   GET /api/reports
// @access  Admin
export const getReports = async (req, res, next) => {
    try {
        const reports = await Report.find({})
            .populate('reporter', 'name email')
            .populate('reportedUser', 'name email')
            .populate('donation', 'itemName category')
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        next(error);
    }
};

// @desc    Get my submitted reports
// @route   GET /api/reports/my
// @access  Private
export const getMyReports = async (req, res, next) => {
    try {
        const reports = await Report.find({ reporter: req.user._id })
            .populate('reportedUser', 'name email')
            .populate('donation', 'itemName')
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        next(error);
    }
};

// @desc    Update report status (admin only)
// @route   PATCH /api/reports/:id/status
// @access  Admin
export const updateReportStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const report = await Report.findById(req.params.id);

        if (!report) {
            res.status(404);
            throw new Error('Report not found');
        }

        report.status = status;
        const updated = await report.save();
        res.json(updated);
    } catch (error) {
        next(error);
    }
};
