import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
    {
        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        reportedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        donation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Donation',
            default: null,
        },
        reason: {
            type: String,
            required: true,
            enum: [
                'fake_donation',
                'fraudulent_request',
                'inappropriate_content',
                'suspicious_user',
                'spam',
                'other',
            ],
        },
        description: {
            type: String,
            required: true,
            maxlength: 1000,
        },
        status: {
            type: String,
            enum: ['pending', 'reviewed', 'resolved'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

const Report = mongoose.model('Report', reportSchema);
export default Report;
