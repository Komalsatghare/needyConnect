import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Calendar, MapPin, User, MessageSquare, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import api from '../../services/api';

export default function RequestDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const socket = useSocket(token);

    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [accepting, setAccepting] = useState(false);
    const [acceptError, setAcceptError] = useState('');
    // chatId for a helper who has already accepted this request
    const [existingChatId, setExistingChatId] = useState(null);

    // Notification for needy user: shown when their request gets accepted
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const { data } = await api.get(`/requests/${id}`);
                setRequest(data);
            } catch {
                setError('Request not found or failed to load.');
            } finally {
                setLoading(false);
            }
        };
        fetchRequest();
    }, [id]);

    // For helpers: check if they already have a chat for this request
    useEffect(() => {
        if (!user) return;
        const findExistingChat = async () => {
            try {
                const { data: chats } = await api.get('/chat/my-chats');
                const match = chats.find(
                    (c) => (c.requestId?._id || c.requestId)?.toString() === id
                );
                if (match) setExistingChatId(match._id);
            } catch {
                // not critical — ignore errors
            }
        };
        findExistingChat();
    }, [user, id]);

    // Listen for real-time acceptance notification (for the needy user)
    useEffect(() => {
        if (!socket) return;

        const handleAccepted = (data) => {
            setNotification(data);
            // Refresh request to show updated status
            api.get(`/requests/${id}`).then(({ data: updated }) => setRequest(updated));
        };

        socket.on('request_accepted', handleAccepted);
        return () => socket.off('request_accepted', handleAccepted);
    }, [socket, id]);

    const handleAccept = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setAccepting(true);
        setAcceptError('');
        try {
            const { data } = await api.post('/help/accept', { requestId: id });
            navigate(`/chat/${data.chatId}`);
        } catch (err) {
            setAcceptError(err.response?.data?.message || 'Failed to accept request. Please try again.');
        } finally {
            setAccepting(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return <Badge variant="warning">Pending</Badge>;
            case 'accepted': return <Badge variant="success">Accepted</Badge>;
            case 'completed': return <Badge variant="default">Completed</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const isOwner = user && request && (request.createdBy._id || request.createdBy).toString() === user._id?.toString();
    const isAccepted = request?.status === 'accepted' || request?.status === 'completed';

    const getLifecycleIndex = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 0; // Requested
            case 'accepted':
                return 2; // Processing
            case 'completed':
                return 3; // Delivered
            default:
                return 0;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32 gap-3 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading request...</span>
            </div>
        );
    }

    if (error || !request) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-slate-900">Request not found</h2>
                <p className="text-slate-500 mt-2">{error}</p>
                <Button asChild className="mt-6">
                    <Link to="/requests">Back to Requests</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link to="/requests" className="text-sm font-medium text-slate-500 hover:text-primary-600 mb-6 inline-block">
                &larr; Back to Requests
            </Link>

            {/* Real-time acceptance notification banner */}
            {notification && (
                <div className="mb-6 flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-semibold text-green-800">{notification.message}</p>
                        <p className="text-sm text-green-700 mt-0.5">
                            {notification.helperName} is ready to help you with "{notification.requestTitle}".
                        </p>
                        <Button
                            size="sm"
                            className="mt-3"
                            onClick={() => navigate(`/chat/${notification.chatId}`)}
                        >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Open Chat
                        </Button>
                    </div>
                    <button
                        onClick={() => setNotification(null)}
                        className="text-green-500 hover:text-green-700 text-lg leading-none"
                        aria-label="Dismiss"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-none shadow-md">
                        <CardHeader className="border-b border-border/50 pb-6">
                            <div className="flex justify-between items-start gap-4 mb-4">
                                <Badge variant="outline" className="text-primary-700 bg-primary-50">
                                    {request.category}
                                </Badge>
                                {getStatusBadge(request.status)}
                            </div>
                            <CardTitle className="text-3xl">{request.title}</CardTitle>
                            <div className="flex flex-wrap gap-4 mt-6 text-sm text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <User className="h-4 w-4" />
                                    {request.createdBy?.name || 'Unknown'}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(request.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4" />
                                    {request.location}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 prose prose-slate">
                            <div className="mb-6">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                                    Request Progress
                                </p>
                                <div className="relative flex items-center justify-between">
                                    <div className="absolute left-3 right-3 h-px bg-slate-200" />
                                    {['Requested', 'Accepted', 'Processing', 'Delivered'].map((label, idx) => {
                                        const currentIdx = getLifecycleIndex(request.status);
                                        const isDone = idx < currentIdx;
                                        const isCurrent = idx === currentIdx;
                                        return (
                                            <div key={label} className="relative z-10 flex flex-col items-center flex-1">
                                                <div
                                                    className={[
                                                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold',
                                                        isDone || isCurrent
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-slate-100 text-slate-400 border border-slate-200',
                                                    ].join(' ')}
                                                >
                                                    {idx + 1}
                                                </div>
                                                <p
                                                    className={[
                                                        'mt-2 text-[10px] font-medium text-center',
                                                        isDone || isCurrent ? 'text-green-700' : 'text-slate-400',
                                                    ].join(' ')}
                                                >
                                                    {label}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Description</h3>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {request.description}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-none shadow-md sticky top-24">
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {isOwner ? 'Your Request' : 'Can you help?'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isOwner ? (
                                <p className="text-sm text-slate-600">
                                    This is your request. You'll be notified when someone accepts it.
                                </p>
                            ) : (
                                <>
                                    <p className="text-sm text-slate-600">
                                        If you can help fulfill this request, click below to accept and open a chat.
                                    </p>
                                    {acceptError && (
                                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                                            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-700">{acceptError}</p>
                                        </div>
                                    )}
                                    {existingChatId ? (
                                        // Helper already accepted — show Open Chat button
                                        <Button
                                            className="w-full flex items-center gap-2"
                                            size="lg"
                                            onClick={() => navigate(`/chat/${existingChatId}`)}
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                            Open Chat
                                        </Button>
                                    ) : (
                                        <Button
                                            className="w-full flex items-center gap-2"
                                            size="lg"
                                            onClick={handleAccept}
                                            disabled={accepting || isAccepted}
                                        >
                                            {accepting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Accepting...
                                                </>
                                            ) : (
                                                <>
                                                    <MessageSquare className="h-4 w-4" />
                                                    {isAccepted ? 'Already Accepted' : 'Accept & Chat'}
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
