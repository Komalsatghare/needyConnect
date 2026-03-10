import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export function useSocket(token) {
    const socketRef = useRef(null);
    const [, forceUpdate] = useState(0);

    useEffect(() => {
        if (!token) return;

        // Only create a new connection if one doesn't exist
        if (!socketRef.current || socketRef.current.disconnected) {
            socketRef.current = io('http://localhost:5000', {
                auth: { token },
                transports: ['websocket'],
            });
            // Trigger re-render so components get the socket instance
            forceUpdate((n) => n + 1);
        }

        return () => {
            // Keep socket alive across navigations — don't disconnect
        };
    }, [token]);

    return socketRef.current;
}
