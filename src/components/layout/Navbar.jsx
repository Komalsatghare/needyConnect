import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, LayoutDashboard, User, MessageSquare, Map } from 'lucide-react';
import NotificationBell from '../shared/NotificationBell';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-white/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="text-2xl font-bold text-primary-600">
                    NeedyConnect
                </Link>
                <div className="hidden md:flex items-center gap-6">
                    <Link to="/" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Home</Link>
                    <Link to="/requests" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Requests</Link>
                    <Link to="/donations" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Donations</Link>
                    <Link to="/map" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors flex items-center gap-1">
                        <Map className="h-3.5 w-3.5" /> Map
                    </Link>
                    <div className="h-6 w-px bg-border mx-2" />

                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link
                                to="/dashboard"
                                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </Link>
                            <Link
                                to="/my-chats"
                                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
                            >
                                <MessageSquare className="h-4 w-4" />
                                Messages
                            </Link>
                            <NotificationBell />
                            <Link
                                to="/profile"
                                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
                            >
                                <User className="h-4 w-4" />
                                {user.name?.split(' ')[0]}
                            </Link>
                            {user.role === 'admin' && (
                                <Link
                                    to="/admin"
                                    className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                                >
                                    Admin
                                </Link>
                            )}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Login</Link>
                            <Link to="/signup" className="text-sm font-medium bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

