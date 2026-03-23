import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Activity, Gift, HandHeart, Loader2, MessageSquare, Pencil, Trash2, CheckCircle } from 'lucide-react';
import DonationProgressTracker from '../components/shared/DonationProgressTracker';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import api from '../services/api';

export default function Dashboard() {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const socket = useSocket(token);

    const [myRequests, setMyRequests] = useState([]);
    const [myDonations, setMyDonations] = useState([]);
    const [chatMap, setChatMap] = useState({});      // requestId → chatId
    const [donationChatMap, setDonationChatMap] = useState({}); // donationId → chatId
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    // Real-time: donor sees notification when someone claims their donation
    const [donorAlert, setDonorAlert] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [reqRes, donRes, , chatRes] = await Promise.all([
                    api.get('/requests/my'),
                    api.get('/donations/my'),
                    api.get('/donations/my-claims'),
                    api.get('/chat/my-chats'),
                ]);
                setMyRequests(reqRes.data);
                setMyDonations(donRes.data);

                // Build request→chatId map
                const rMap = {};
                const dMap = {};
                chatRes.data.forEach((c) => {
                    const rid = (c.requestId?._id || c.requestId)?.toString();
                    if (rid) rMap[rid] = c._id;
                    const did = (c.donationId?._id || c.donationId)?.toString();
                    if (did) dMap[did] = c._id;
                });
                setChatMap(rMap);
                setDonationChatMap(dMap);
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    // Real-time donation claim notification for the donor
    useEffect(() => {
        if (!socket) return;
        const handle = (data) => setDonorAlert(data);
        socket.on('donation_claimed', handle);
        return () => socket.off('donation_claimed', handle);
    }, [socket]);

    const handleDeleteRequest = async (reqId) => {
        if (!window.confirm('Delete this request?')) return;
        setDeletingId(reqId);
        try {
            await api.delete(`/requests/delete/${reqId}`);
            setMyRequests((prev) => prev.filter((r) => r._id !== reqId));
        } catch { alert('Failed to delete request.'); }
        finally { setDeletingId(null); }
    };

    const handleDeleteDonation = async (donId) => {
        if (!window.confirm('Delete this donation?')) return;
        setDeletingId(donId);
        try {
            await api.delete(`/donations/delete/${donId}`);
            setMyDonations((prev) => prev.filter((d) => d._id !== donId));
        } catch { alert('Failed to delete donation.'); }
        finally { setDeletingId(null); }
    };

    const requestsPosted = myRequests.length;
    const donationsPosted = myDonations.length;
    const activeRequests = myRequests.filter(r => r.status === 'pending').length;

    const statusPill = (status) => {
        const cls =
            status === 'pending'   ? 'bg-yellow-100 text-yellow-700' :
            status === 'accepted'  ? 'bg-green-100 text-green-700'  :
            status === 'available' ? 'bg-blue-100 text-blue-700'    :
            status === 'claimed'   ? 'bg-green-100 text-green-700'  :
            'bg-slate-100 text-slate-600';
        return <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${cls}`}>{status}</span>;
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Welcome, {user?.name?.split(' ')[0]}!</h1>
                    <p className="text-slate-500 mt-1">Here's your community impact at a glance.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Button asChild className="flex-1 md:flex-none">
                        <Link to="/requests/new">Post Request</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 md:flex-none">
                        <Link to="/donations/new">Offer Donation</Link>
                    </Button>
                </div>
            </div>

            {/* Donor real-time alert */}
            {donorAlert && (
                <div className="mb-6 flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-semibold text-green-800">{donorAlert.message}</p>
                        <p className="text-sm text-green-700 mt-0.5">
                            {donorAlert.claimerName} wants your <strong>{donorAlert.itemName}</strong>.
                        </p>
                        <Button size="sm" className="mt-3" onClick={() => navigate(`/chat/${donorAlert.chatId}`)}>
                            <MessageSquare className="h-4 w-4 mr-2" /> Open Chat
                        </Button>
                    </div>
                    <button onClick={() => setDonorAlert(null)} className="text-green-500 hover:text-green-700 text-lg">×</button>
                </div>
            )}

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
                <Card className="bg-primary-50/50 border-primary-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Requests Posted</CardTitle>
                        <HandHeart className="h-4 w-4 text-primary-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary-900">
                            {loading ? <Loader2 className="h-7 w-7 animate-spin" /> : requestsPosted}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-secondary-50/50 border-secondary-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Donations Offered</CardTitle>
                        <Gift className="h-4 w-4 text-secondary-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-secondary-900">
                            {loading ? <Loader2 className="h-7 w-7 animate-spin" /> : donationsPosted}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-amber-50/50 border-amber-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Active Requests</CardTitle>
                        <Activity className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-900">
                            {loading ? <Loader2 className="h-7 w-7 animate-spin" /> : activeRequests}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* My Requests */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>My Requests</CardTitle>
                        <Link to="/my-chats" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                            View My Chats →
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center gap-3 text-slate-500 py-4">
                            <Loader2 className="h-5 w-5 animate-spin" /><span>Loading...</span>
                        </div>
                    ) : myRequests.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <p>You haven't posted any requests yet.</p>
                            <Button asChild className="mt-4"><Link to="/requests/new">Post Your First Request</Link></Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {myRequests.slice(0, 10).map((req) => (
                                <div
                                    key={req._id}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/requests/${req._id}`)}
                                >
                                    <div className="mt-0.5 rounded-full p-2 bg-primary-100 text-primary-600 shrink-0">
                                        <HandHeart className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">{req.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{req.category} • {req.location}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                                        {statusPill(req.status)}
                                        {req.status === 'accepted' && chatMap[req._id] && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/chat/${chatMap[req._id]}`);
                                                }}
                                                className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-2 py-1 rounded-full transition-colors"
                                            >
                                                <MessageSquare className="h-3 w-3" /> Chat
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/requests/edit/${req._id}`);
                                            }}
                                            className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-2 py-1 rounded-full transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil className="h-3 w-3" /> Edit
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteRequest(req._id);
                                            }}
                                            disabled={deletingId === req._id}
                                            className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 px-2 py-1 rounded-full transition-colors disabled:opacity-50"
                                            title="Delete"
                                        >
                                            {deletingId === req._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />} Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* My Donations */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>My Donations</CardTitle>
                        <Link to="/donations/new" className="text-sm text-primary-600 hover:underline">
                            + Add Donation
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center gap-3 text-slate-500 py-4">
                            <Loader2 className="h-5 w-5 animate-spin" /><span>Loading...</span>
                        </div>
                    ) : myDonations.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <p>You haven't offered any donations yet.</p>
                            <Button asChild className="mt-4"><Link to="/donations/new">Offer a Donation</Link></Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {myDonations.slice(0, 10).map((don) => (
                                <div key={don._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="mt-0.5 rounded-full p-2 bg-secondary-100 text-secondary-600 shrink-0">
                                        <Gift className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">{don.itemName}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{don.category} • Qty: {don.quantity}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                                        {statusPill(don.status || 'available')}
                                        {(don.status === 'claimed') && donationChatMap[don._id] && (
                                            <button
                                                onClick={() => navigate(`/chat/${donationChatMap[don._id]}`)}
                                                className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-2 py-1 rounded-full transition-colors"
                                            >
                                                <MessageSquare className="h-3 w-3" /> Chat
                                            </button>
                                        )}
                                        <button
                                            onClick={() => navigate(`/donations/edit/${don._id}`)}
                                            className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-2 py-1 rounded-full transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil className="h-3 w-3" /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteDonation(don._id)}
                                            disabled={deletingId === don._id}
                                            className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 px-2 py-1 rounded-full transition-colors disabled:opacity-50"
                                            title="Delete"
                                        >
                                            {deletingId === don._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />} Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
