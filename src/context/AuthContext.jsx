import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Use sessionStorage so each browser tab has its own independent session.
// This allows two different users to be logged in simultaneously in separate tabs.
const storage = {
    getUser: () => {
        try {
            const s = sessionStorage.getItem('needyConnectUser');
            return s ? JSON.parse(s) : null;
        } catch { return null; }
    },
    getToken: () => sessionStorage.getItem('needyConnectToken') || null,
    setUser: (u) => sessionStorage.setItem('needyConnectUser', JSON.stringify(u)),
    setToken: (t) => sessionStorage.setItem('needyConnectToken', t),
    clear: () => {
        sessionStorage.removeItem('needyConnectUser');
        sessionStorage.removeItem('needyConnectToken');
    },
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => storage.getUser());
    const [token, setToken] = useState(() => storage.getToken());

    const login = (userData, jwtToken) => {
        setUser(userData);
        setToken(jwtToken);
        storage.setUser(userData);
        storage.setToken(jwtToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        storage.clear();
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
