import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import api from '../../services/api';
import { Send, ArrowLeft, Loader2, Phone, Video, MoreVertical } from 'lucide-react';

// ─── Normalize a raw message from API or Socket into a consistent shape ───────
// After this, every message in state has:
//   msg.senderIdStr  → plain string (hex)
//   msg.senderName   → display name string
function normalizeMessage(msg) {
    // senderId can be:
    //   - A populated object: { _id: "abc", name: "John" }
    //   - A plain string:    "abc"
    const senderObj = msg.senderId;
    const senderIdStr =
        typeof senderObj === 'object' && senderObj !== null
            ? String(senderObj._id ?? '')
            : String(senderObj ?? '');
    const senderName =
        typeof senderObj === 'object' && senderObj !== null
            ? senderObj.name ?? ''
            : '';

    return { ...msg, senderIdStr, senderName };
}

export default function Chat() {
    const { chatId } = useParams();
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const socket = useSocket(token);

    // currentUserId is always a plain string — extracted once
    const currentUserId = String(user?._id ?? '');

    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);   // always normalized
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // ── Load chat data & message history ─────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            try {
                const [chatRes, msgRes] = await Promise.all([
                    api.get(`/chat/${chatId}`),
                    api.get(`/chat/${chatId}/messages`),
                ]);
                setChat(chatRes.data);
                // Normalize ALL messages on load
                setMessages(msgRes.data.map(normalizeMessage));
            } catch (err) {
                if (err.response?.status === 403) {
                    navigate('/dashboard');
                } else {
                    setError('Failed to load chat. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [chatId, navigate]);

    // ── Socket.io: join room + listen for new messages ────────────────────────
    useEffect(() => {
        if (!socket || !chatId) return;
        socket.emit('join_chat', chatId);

        const handleNewMessage = (rawMsg) => {
            const msg = normalizeMessage(rawMsg);
            setMessages((prev) => {
                // Deduplicate by _id
                if (prev.find((m) => m._id === msg._id)) return prev;
                return [...prev, msg];
            });
        };

        socket.on('new_message', handleNewMessage);
        return () => {
            socket.off('new_message', handleNewMessage);
            socket.emit('leave_chat', chatId);
        };
    }, [socket, chatId]);

    // ── Send message ──────────────────────────────────────────────────────────
    const handleSend = async (e) => {
        e.preventDefault();
        const content = newMessage.trim();
        if (!content || sending) return;
        setSending(true);
        try {
            await api.post(`/chat/${chatId}/send`, { content });
            setNewMessage('');
            inputRef.current?.focus();
        } catch {
            setError('Failed to send message.');
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
    const getOtherUser = () => {
        if (!chat) return null;
        const helperId = String(chat.helperId?._id ?? chat.helperId ?? '');
        return helperId === currentUserId ? chat.needyUserId : chat.helperId;
    };

    const formatTime = (date) =>
        new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const formatDateLabel = (dateStr) => {
        const d = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        if (d.toDateString() === today.toDateString()) return 'TODAY';
        if (d.toDateString() === yesterday.toDateString()) return 'YESTERDAY';
        return d.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
    };

    // Group messages by calendar date
    const groupedMessages = messages.reduce((groups, msg) => {
        const key = new Date(msg.createdAt).toDateString();
        if (!groups[key]) groups[key] = [];
        groups[key].push(msg);
        return groups;
    }, {});

    const otherUser = getOtherUser();
    const avatarInitial = otherUser?.name?.[0]?.toUpperCase() || '?';

    // ── Loading / error states ────────────────────────────────────────────────
    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 4rem)', background: '#0b141a' }}>
                <Loader2 style={{ width: 32, height: 32, color: '#00a884', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    if (error && !chat) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 4rem)', gap: 16, background: '#0b141a' }}>
                <p style={{ color: '#ef4444' }}>{error}</p>
                <Link to="/dashboard" style={{ color: '#00a884' }}>Back to Dashboard</Link>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 4rem)',
            maxWidth: 768,
            margin: '0 auto',
            background: '#0b141a',
        }}>

            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 16px',
                background: '#202c33',
                boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                flexShrink: 0,
            }}>
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', borderRadius: '50%' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    aria-label="Back to dashboard"
                >
                    <ArrowLeft style={{ width: 20, height: 20, color: '#aebac1' }} />
                </button>

                <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: '#00a884',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 16, color: '#fff', flexShrink: 0,
                }}>
                    {avatarInitial}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 16, color: '#e9edef', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {otherUser?.name || 'User'}
                    </p>
                    {chat?.requestId?.title && (
                        <p style={{ margin: 0, fontSize: 12, color: '#8696a0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            Re: {chat.requestId.title}
                        </p>
                    )}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                    {[Video, Phone, MoreVertical].map((Icon, i) => (
                        <button key={i}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: '50%', display: 'flex' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                            <Icon style={{ width: 20, height: 20, color: '#aebac1' }} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Messages area */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px 6%',
                background: '#0b141a',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}>
                {messages.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, textAlign: 'center' }}>
                        <div style={{ fontSize: 48 }}>💬</div>
                        <p style={{ margin: 0, color: '#8696a0', fontSize: 15 }}>No messages yet</p>
                        <p style={{ margin: 0, color: '#8696a0', fontSize: 13 }}>Say hi to get started! 👋</p>
                    </div>
                ) : (
                    Object.entries(groupedMessages).map(([dateKey, dayMsgs]) => (
                        <div key={dateKey}>
                            {/* Date separator */}
                            <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0 8px' }}>
                                <span style={{
                                    background: '#182229', color: '#8696a0',
                                    fontSize: 11, fontWeight: 600, letterSpacing: '0.5px',
                                    padding: '4px 10px', borderRadius: 8,
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                }}>
                                    {formatDateLabel(dayMsgs[0].createdAt)}
                                </span>
                            </div>

                            {dayMsgs.map((msg) => {
                                /**
                                 * ALIGNMENT LOGIC — based purely on sender ID
                                 *
                                 * msg.senderIdStr  = normalized plain string set at ingestion time
                                 * currentUserId    = plain string from user._id in AuthContext
                                 *
                                 * isSent = true  → I sent this → RIGHT side (green bubble)
                                 * isSent = false → they sent it → LEFT side (dark bubble)
                                 */
                                const isSent = msg.senderIdStr === currentUserId;

                                return (
                                    <div
                                        key={msg._id}
                                        style={{
                                            display: 'flex',
                                            justifyContent: isSent ? 'flex-end' : 'flex-start',
                                            marginBottom: 3,
                                        }}
                                    >
                                        <div style={{
                                            position: 'relative',
                                            maxWidth: '65%',
                                            padding: '7px 12px 20px',
                                            borderRadius: isSent
                                                ? '10px 10px 2px 10px'
                                                : '10px 10px 10px 2px',
                                            background: isSent ? '#005c4b' : '#202c33',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.4)',
                                            wordBreak: 'break-word',
                                        }}>
                                            {/* Bubble tail */}
                                            <div style={{
                                                position: 'absolute',
                                                top: 0,
                                                [isSent ? 'right' : 'left']: -6,
                                                width: 0, height: 0,
                                                borderTop: `8px solid ${isSent ? '#005c4b' : '#202c33'}`,
                                                [isSent ? 'borderLeft' : 'borderRight']: '6px solid transparent',
                                            }} />

                                            {/* Sender label (received messages only) */}
                                            {!isSent && msg.senderName && (
                                                <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 600, color: '#00a884' }}>
                                                    {msg.senderName}
                                                </p>
                                            )}

                                            {/* Message text */}
                                            <p style={{ margin: 0, fontSize: 14.5, color: '#e9edef', lineHeight: 1.5 }}>
                                                {msg.content}
                                            </p>

                                            {/* Timestamp + ticks */}
                                            <span style={{
                                                position: 'absolute',
                                                bottom: 5, right: 10,
                                                fontSize: 10,
                                                color: isSent ? '#8eb5af' : '#8696a0',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {formatTime(msg.createdAt)}
                                                {isSent && <span style={{ marginLeft: 3 }}>✓✓</span>}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                background: '#202c33',
                flexShrink: 0,
            }}>
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    background: '#2a3942',
                    borderRadius: 24,
                    padding: '8px 16px',
                }}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message"
                        disabled={sending}
                        style={{
                            flex: 1,
                            background: 'none',
                            border: 'none',
                            outline: 'none',
                            fontSize: 15,
                            color: '#e9edef',
                            caretColor: '#00a884',
                        }}
                    />
                </div>

                <button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    style={{
                        width: 44, height: 44,
                        borderRadius: '50%',
                        border: 'none',
                        background: newMessage.trim() ? '#00a884' : '#2a3942',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                        flexShrink: 0,
                        transition: 'background 0.2s',
                        boxShadow: newMessage.trim() ? '0 2px 8px rgba(0,168,132,0.4)' : 'none',
                    }}
                    aria-label="Send message"
                >
                    {sending
                        ? <Loader2 style={{ width: 20, height: 20, color: '#fff', animation: 'spin 1s linear infinite' }} />
                        : <Send style={{ width: 18, height: 18, color: newMessage.trim() ? '#fff' : '#8696a0', marginLeft: 2 }} />
                    }
                </button>
            </div>
        </div>
    );
}
