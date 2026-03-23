import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export function useSocket(token) {
    const socketRef = useRef(null);
    const [, forceUpdate] = useState(0);

    useEffect(() => {
        // No token = no socket (logged out)
        if (!token) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                forceUpdate((n) => n + 1);
            }
            return;
        }

        // If a socket already exists with the same token, keep it alive
        if (socketRef.current && socketRef.current.connected) {
            return;
        }

        // Disconnect any stale socket (e.g. previous user's session)
        if (socketRef.current) {
            socketRef.current.disconnect();
        }

        socketRef.current = io('http://localhost:5000', {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        // Trigger re-render so components get the new socket instance
        forceUpdate((n) => n + 1);

        return () => {
            // On logout/token change, disconnect immediately
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [token]);

    return socketRef.current;
}
