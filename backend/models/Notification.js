import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['nearby_donation', 'request_sent', 'request_accepted', 'donation_completed', 'system'],
            default: 'system',
        },

        isRead: {
            type: Boolean,
            default: false,
        },
        relatedDonation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Donation',
            default: null,
        },
        distance: {
            type: Number, // in km
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
