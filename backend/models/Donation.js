import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
    {
        itemName: {
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
        quantity: {
            type: Number,
            required: true,
            default: 1,
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
        // GeoJSON Point for geospatial queries (optional)
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
        // Donation lifecycle status
        lifecycleStatus: {
            type: String,
            enum: ['posted', 'requested', 'accepted', 'delivered', 'completed'],
            default: 'posted',
        },
        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
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
donationSchema.index({ coordinates: '2dsphere' }, { sparse: true });

const Donation = mongoose.model('Donation', donationSchema);
export default Donation;
