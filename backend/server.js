import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import helpRoutes from './routes/helpRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import User from './models/User.js';

dotenv.config();

connectDB();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

app.use(cors());
app.use(express.json());

// Socket.io authentication middleware
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error: no token'));
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return next(new Error('Authentication error: user not found'));
        }
        socket.user = user;
        next();
    } catch (err) {
        next(new Error('Authentication error: invalid token'));
    }
});

io.on('connection', (socket) => {
    // Each user joins their own personal room for targeted notifications
    const userId = socket.user._id.toString();
    socket.join(userId);

    // Join a specific chat room
    socket.on('join_chat', (chatId) => {
        socket.join(chatId);
    });

    // Leave a chat room
    socket.on('leave_chat', (chatId) => {
        socket.leave(chatId);
    });

    socket.on('disconnect', () => {
        // cleanup handled by socket.io automatically
    });
});

app.get('/', (req, res) => {
    res.send('NeedyConnect API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/help', helpRoutes);
app.use('/api/chat', chatRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
