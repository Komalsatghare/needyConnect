import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
    {
        // Populated for request-based chats
        requestId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Request',
        },
        // Populated for donation-claim chats
        donationId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Donation',
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
    },
    {
        timestamps: true,
    }
);

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
