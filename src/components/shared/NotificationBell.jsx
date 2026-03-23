import { useState, useEffect, useRef } from 'react';
import { Bell, X, MapPin, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../context/AuthContext';

export default function NotificationBell() {
    const { user } = useAuth();
    const socket = useSocket();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const panelRef = useRef(null);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    useEffect(() => {
        if (!user) return;
        api.get('/notifications').then(({ data }) => setNotifications(data)).catch(() => {});
    }, [user]);

    // Listen for real-time notifications
    useEffect(() => {
        if (!socket) return;
        const handleNew = (notif) => {
            setNotifications((prev) => [notif, ...prev]);
        };
        socket.on('new_notification', handleNew);
        return () => socket.off('new_notification', handleNew);
    }, [socket]);

    // Close panel when clicking outside
    useEffect(() => {
        const handleClick = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    const markAllRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        } catch {}
    };

    const handleNotifClick = (notif) => {
        if (!notif.isRead) {
            api.patch(`/notifications/${notif._id}/read`).catch(() => {});
            setNotifications((prev) => prev.map((n) => n._id === notif._id ? { ...n, isRead: true } : n));
        }
        if (notif.relatedDonation?._id) {
            navigate(`/donations/${notif.relatedDonation._id}`);
            setOpen(false);
        }
    };

    return (
        <div style={{ position: 'relative' }} ref={panelRef}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: open ? '#1d4ed8' : '#64748b', padding: '4px',
                    transition: 'color 0.2s',
                }}
                title="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '-4px', right: '-4px',
                        background: '#ef4444', color: '#fff',
                        borderRadius: '999px', fontSize: '10px', fontWeight: 700,
                        minWidth: '16px', height: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 3px', border: '2px solid #fff',
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 12px)', right: '-12px',
                    width: '340px', background: '#fff',
                    borderRadius: '16px', boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                    border: '1px solid #e2e8f0', zIndex: 9000, overflow: 'hidden',
                }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Notifications</span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} title="Mark all as read" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}>
                                    <CheckCheck size={13} /> Mark all read
                                </button>
                            )}
                            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                                <X size={15} />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                                <Bell size={28} style={{ marginBottom: '8px', opacity: 0.4 }} />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif._id}
                                    onClick={() => handleNotifClick(notif)}
                                    style={{
                                        padding: '12px 16px', cursor: 'pointer',
                                        background: notif.isRead ? '#fff' : '#eff6ff',
                                        borderBottom: '1px solid #f8fafc',
                                        display: 'flex', gap: '10px', alignItems: 'flex-start',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                    onMouseLeave={e => e.currentTarget.style.background = notif.isRead ? '#fff' : '#eff6ff'}
                                >
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: notif.type === 'nearby_donation' ? '#dbeafe' : '#f0fdf4',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <MapPin size={14} color={notif.type === 'nearby_donation' ? '#1d4ed8' : '#16a34a'} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: '13px', color: '#0f172a', lineHeight: 1.4, fontWeight: notif.isRead ? 400 : 600 }}>
                                            {notif.message}
                                        </p>
                                        <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                                            {new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    {!notif.isRead && (
                                        <div style={{ width: '8px', height: '8px', background: '#1d4ed8', borderRadius: '50%', flexShrink: 0, marginTop: '4px' }} />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
