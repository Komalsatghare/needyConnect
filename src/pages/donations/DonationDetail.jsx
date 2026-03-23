import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    MapPin, Package, ArrowLeft, User, Tag, Layers, Loader2,
    MessageSquare, CheckCircle, CheckCircle2, AlertCircle, Flag,
    Send, Clock, Truck, Star,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import api from '../../services/api';
import TrustBadge from '../../components/shared/TrustBadge';
import ReportModal from '../../components/shared/ReportModal';
import { toast } from '../../components/shared/Toast';

// ─── Lifecycle Progress Bar ──────────────────────────────────────────────────
const LIFECYCLE_STEPS = [
    { key: 'posted',    label: 'Donation Posted',   icon: Package },
    { key: 'requested', label: 'Request Sent',       icon: Send },
    { key: 'accepted',  label: 'Request Accepted',   icon: CheckCircle2 },
    { key: 'delivered', label: 'Item Delivered',     icon: Truck },
    { key: 'completed', label: 'Completed',          icon: Star },
];

function LifecycleBar({ status, justSent = false }) {
    const currentIdx = LIFECYCLE_STEPS.findIndex((s) => s.key === status);
    const activeIdx = currentIdx === -1 ? 0 : currentIdx;

    return (
        <div style={{ padding: '20px 6px 8px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                {/* Connector lines */}
                <div style={{
                    position: 'absolute', top: '16px', left: '16px',
                    right: '16px', height: '3px', background: '#e2e8f0', borderRadius: '4px',
                }} />
                {/* Filled connector */}
                <div style={{
                    position: 'absolute', top: '16px', left: '16px',
                    width: `${(activeIdx / (LIFECYCLE_STEPS.length - 1)) * 100}%`,
                    height: '3px',
                    background: 'linear-gradient(90deg, #16a34a, #22c55e)',
                    borderRadius: '4px',
                    transition: 'width 0.8s ease',
                }} />

                {LIFECYCLE_STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const isDone = i < activeIdx;
                    const isActive = i === activeIdx;
                    const pulse = isActive && justSent && step.key === 'requested';

                    return (
                        <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: isDone || isActive
                                    ? 'linear-gradient(135deg, #16a34a, #22c55e)'
                                    : '#f1f5f9',
                                border: isActive ? '3px solid #bbf7d0' : isDone ? 'none' : '2px solid #e2e8f0',
                                boxShadow: isActive ? '0 0 0 4px rgba(22,163,74,0.15)' : isDone ? '0 2px 6px rgba(22,163,74,0.2)' : 'none',
                                transition: 'all 0.5s ease',
                                animation: pulse ? 'ring-pulse 1s ease-out 2' : 'none',
                            }}>
                                <Icon size={14} color={isDone || isActive ? '#fff' : '#94a3b8'} />
                            </div>
                            <p style={{
                                fontSize: '10px', fontWeight: isActive ? 700 : 500,
                                color: isDone || isActive ? '#16a34a' : '#94a3b8',
                                marginTop: '8px', textAlign: 'center', lineHeight: 1.3,
                                maxWidth: '60px',
                            }}>
                                {step.label}
                            </p>
                        </div>
                    );
                })}
            </div>
            <style>{`
                @keyframes ring-pulse {
                    0%   { box-shadow: 0 0 0 0 rgba(22,163,74,0.5); }
                    70%  { box-shadow: 0 0 0 10px rgba(22,163,74,0); }
                    100% { box-shadow: 0 0 0 0 rgba(22,163,74,0); }
                }
            `}</style>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function DonationDetail() {
    const { id } = useParams();
    const { user: authUser, token } = useAuth();
    const navigate = useNavigate();
    const socket = useSocket(token);

    const [donation, setDonation] = useState(null);
    const [showReport, setShowReport] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Claim flow states
    const [claiming, setClaiming] = useState(false);
    const [claimError, setClaimError] = useState('');
    const [claimedChatId, setClaimedChatId] = useState(null);
    const [justSent, setJustSent] = useState(false); // drives pulse animation

    // Donor real-time notification
    const [donorNotification, setDonorNotification] = useState(null);

    // ─── Current lifecycle status (local, can be speculatively updated) ───────
    const [localLifecycle, setLocalLifecycle] = useState('posted');

    useEffect(() => {
        const fetchDonation = async () => {
            try {
                const { data } = await api.get(`/donations/${id}`);
                setDonation(data);
                setLocalLifecycle(data.lifecycleStatus || 'posted');

                // If donation is already claimed by someone there might already be a chat
                // Check if current user already has a chat for this donation
                if (authUser && data.status === 'claimed') {
                    // Speculatively mark as sent if the viewer is the one who claimed it
                    const requestedById = data.requestedBy?._id || data.requestedBy;
                    if (requestedById?.toString() === authUser._id?.toString()) {
                        // Try to find existing chat
                        try {
                            const { data: chats } = await api.get('/chat/my-chats');
                            const existing = chats.find(
                                (c) => (c.donationId?._id || c.donationId)?.toString() === id
                            );
                            if (existing) setClaimedChatId(existing._id);
                        } catch (_) {}
                    }
                }
            } catch {
                setError('Donation not found or has been removed.');
            } finally {
                setLoading(false);
            }
        };
        fetchDonation();
    }, [id, authUser]);

    // Socket: donor sees real-time alert when someone claims
    useEffect(() => {
        if (!socket) return;
        const handle = (data) => setDonorNotification(data);
        socket.on('donation_claimed', handle);
        return () => socket.off('donation_claimed', handle);
    }, [socket]);

    const handleClaim = async () => {
        if (!authUser) { navigate('/login'); return; }
        setClaiming(true);
        setClaimError('');
        try {
            const { data } = await api.post('/help/claim-donation', { donationId: id });
            setClaimedChatId(data.chatId);
            setLocalLifecycle('requested');
            setJustSent(true);

            // Show success toast
            toast('Your request has been successfully sent to the donor! 🎉', 'success', 5000);

            // Update donation state
            setDonation((prev) => prev ? { ...prev, status: 'claimed', lifecycleStatus: 'requested' } : prev);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to request item. Please try again.';
            setClaimError(msg);
            toast(msg, 'error');
        } finally {
            setClaiming(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'available': return <Badge variant="success">Available</Badge>;
            case 'claimed':   return <Badge variant="default">Claimed</Badge>;
            default:          return <Badge variant="outline">{status}</Badge>;
        }
    };

    // ─── Loading / Error ─────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (error || !donation) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-red-600">{error}</p>
                <Button asChild variant="outline"><Link to="/donations">← Back to Donations</Link></Button>
            </div>
        );
    }

    const donorName = donation.createdBy?.name || 'Anonymous';
    const donorPhone = donation.createdBy?.phone;
    const isOwner = authUser && (donation.createdBy?._id || donation.createdBy)?.toString() === authUser._id?.toString();
    const donorId = donation.createdBy?._id || donation.createdBy;
    const alreadySent = !!claimedChatId;

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            {showReport && (
                <ReportModal
                    onClose={() => setShowReport(false)}
                    reportedUser={donorId?.toString()}
                    donation={donation._id}
                />
            )}

            {/* Back + Report */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate('/donations')}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Donations
                </button>
                {authUser && !isOwner && (
                    <button
                        onClick={() => setShowReport(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '999px', padding: '5px 12px', cursor: 'pointer' }}
                    >
                        <Flag size={12} /> Report
                    </button>
                )}
            </div>

            {/* Donor alert: someone claimed your donation */}
            {donorNotification && (
                <div className="mb-6 flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-semibold text-green-800">{donorNotification.message}</p>
                        <p className="text-sm text-green-700 mt-0.5">
                            <strong>{donorNotification.claimerName}</strong> wants your <strong>{donorNotification.itemName}</strong>.
                        </p>
                        <Button size="sm" className="mt-3" onClick={() => navigate(`/chat/${donorNotification.chatId}`)}>
                            <MessageSquare className="h-4 w-4 mr-2" /> Open Chat
                        </Button>
                    </div>
                    <button onClick={() => setDonorNotification(null)} className="text-green-500 hover:text-green-700 text-lg leading-none">×</button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{donation.itemName}</h1>
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                        <Badge variant="outline" className="text-primary-700 bg-primary-50 border-primary-200">
                            {donation.category}
                        </Badge>
                        {donation.status && getStatusBadge(donation.status)}
                    </div>
                </div>
            </div>

            {/* ── Lifecycle Progress Bar ── */}
            <Card className="mb-6 shadow-sm">
                <CardContent className="pt-2 pb-4">
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', paddingTop: '12px', paddingLeft: '4px' }}>
                        Donation Progress
                    </p>
                    <LifecycleBar status={localLifecycle} justSent={justSent} />
                </CardContent>
            </Card>

            {/* ── Success confirmation panel (shown only after claim) ── */}
            {alreadySent && (
                <div style={{
                    marginBottom: '24px', borderRadius: '16px', overflow: 'hidden',
                    border: '1.5px solid #86efac',
                    background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                }}>
                    <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                        <div style={{ background: '#16a34a', borderRadius: '50%', padding: '6px', flexShrink: 0 }}>
                            <CheckCircle2 size={18} color="#fff" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 700, color: '#14532d', fontSize: '15px', marginBottom: '4px' }}>
                                Request Sent Successfully! 🎉
                            </p>
                            <p style={{ color: '#166534', fontSize: '13px', lineHeight: 1.5 }}>
                                Your request has been successfully sent to the donor. You'll be notified when they accept.
                                Start a chat to discuss pickup or delivery.
                            </p>
                            <button
                                onClick={() => navigate(`/chat/${claimedChatId}`)}
                                style={{
                                    marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '7px',
                                    padding: '9px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                    background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                                    color: '#fff', fontWeight: 700, fontSize: '14px',
                                    boxShadow: '0 2px 10px rgba(22,163,74,0.3)',
                                }}
                            >
                                <MessageSquare size={15} />
                                Chat with Donor
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main details */}
            <Card className="mb-6 shadow-sm">
                <CardContent className="pt-6 space-y-5">
                    <div>
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Description</h2>
                        <p className="text-slate-700 leading-relaxed">{donation.description || 'No description provided.'}</p>
                    </div>

                    <hr className="border-border/50" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-primary-50 p-2">
                                <Layers className="h-4 w-4 text-primary-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Quantity</p>
                                <p className="text-sm font-medium text-slate-900">{donation.quantity ?? '—'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-primary-50 p-2">
                                <Tag className="h-4 w-4 text-primary-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Category</p>
                                <p className="text-sm font-medium text-slate-900">{donation.category}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-primary-50 p-2">
                                <MapPin className="h-4 w-4 text-primary-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Location</p>
                                <p className="text-sm font-medium text-slate-900">{donation.location || '—'}</p>
                            </div>
                        </div>

                        {/* Donor info with trust badge */}
                        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                                background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <User size={18} color="#fff" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Donated by</p>
                                <p className="text-sm font-semibold text-slate-900">{donorName}</p>
                                {donorPhone && <p className="text-xs text-slate-500">{donorPhone}</p>}
                                <div className="mt-1">
                                    <TrustBadge isVerified={donation.createdBy?.isVerified} trustScore={donation.createdBy?.trustScore} size="sm" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {donation.image && (
                        <>
                            <hr className="border-border/50" />
                            <div>
                                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Image</h2>
                                <img
                                    src={donation.image}
                                    alt={donation.itemName}
                                    className="rounded-lg max-h-64 object-cover w-full"
                                    onError={e => e.currentTarget.style.display = 'none'}
                                />
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* ── Action section ── */}
            {isOwner ? (
                <div className="bg-slate-50 border border-border rounded-xl p-5 text-center">
                    <p className="text-slate-600 text-sm">This is your donation listing.</p>
                    <p className="text-slate-500 text-xs mt-1">You'll be notified when someone requests it.</p>
                </div>
            ) : authUser ? (
                <div style={{
                    borderRadius: '16px', overflow: 'hidden',
                    border: alreadySent ? '1.5px solid #86efac' : '1.5px solid #bfdbfe',
                    background: alreadySent ? '#f0fdf4' : '#eff6ff',
                }}>
                    <div style={{ padding: '20px' }}>
                        {!alreadySent && (
                            <>
                                <div className="flex items-center gap-3 mb-3">
                                    <Package className="h-5 w-5 text-primary-600" />
                                    <h3 className="font-semibold text-slate-900">Interested in this item?</h3>
                                </div>
                                <p className="text-sm text-slate-600 mb-4">
                                    Click <strong>Request This Item</strong> to send a request to the donor.
                                    Once confirmed, a chat will open so you can arrange pickup or delivery.
                                </p>
                            </>
                        )}

                        {claimError && (
                            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md mb-4">
                                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700">{claimError}</p>
                            </div>
                        )}

                        {/* ── Request button: changes state after send ── */}
                        {alreadySent ? (
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <button
                                    disabled
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '7px',
                                        padding: '10px 22px', borderRadius: '10px',
                                        background: '#dcfce7', border: '1.5px solid #86efac',
                                        color: '#16a34a', fontWeight: 700, fontSize: '14px', cursor: 'not-allowed',
                                    }}
                                >
                                    <CheckCircle2 size={16} />
                                    Request Sent ✓
                                </button>
                                <button
                                    onClick={() => navigate(`/chat/${claimedChatId}`)}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '7px',
                                        padding: '10px 22px', borderRadius: '10px', border: 'none',
                                        background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)',
                                        color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                                        boxShadow: '0 2px 10px rgba(29,78,216,0.3)',
                                    }}
                                >
                                    <MessageSquare size={16} />
                                    Chat with Donor
                                </button>
                            </div>
                        ) : (
                            <Button
                                style={{ minWidth: '180px' }}
                                onClick={handleClaim}
                                disabled={claiming || donation.status === 'claimed'}
                            >
                                {claiming ? (
                                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Sending Request...</>
                                ) : donation.status === 'claimed' ? (
                                    <><Clock className="h-4 w-4 mr-2" />Already Requested</>
                                ) : (
                                    <><Send className="h-4 w-4 mr-2" />Request This Item</>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-slate-50 border border-border rounded-xl p-5 text-center">
                    <p className="text-slate-600 mb-3">Sign in to request this item.</p>
                    <Button asChild><Link to="/login">Login to Continue</Link></Button>
                </div>
            )}
        </div>
    );
}
