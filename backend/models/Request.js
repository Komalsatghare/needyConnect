import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: false,
            default: '',
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'completed'],
            default: 'pending',
        },
        // GeoJSON Point for location-aware notifications (optional)
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                // No default — keeps the whole field undefined when not provided
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
            },
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// sparse: true — skips documents where coordinates is null/undefined
requestSchema.index({ coordinates: '2dsphere' }, { sparse: true });

const Request = mongoose.model('Request', requestSchema);
export default Request;
