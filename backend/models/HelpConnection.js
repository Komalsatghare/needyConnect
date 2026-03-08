import mongoose from 'mongoose';

const helpConnectionSchema = new mongoose.Schema(
    {
        requestId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Request',
        },
        helperId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        needyUserId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'completed', 'cancelled'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

const HelpConnection = mongoose.model('HelpConnection', helpConnectionSchema);
export default HelpConnection;
