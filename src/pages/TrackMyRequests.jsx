import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loader2, MessageSquare } from 'lucide-react';
import DonationProgressTracker from '../components/shared/DonationProgressTracker';
import api from '../services/api';

export default function TrackMyRequests() {
    const [items, setItems] = useState([]);
    const [chatMap, setChatMap] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [claimedRes, chatRes] = await Promise.all([
                    api.get('/donations/my-claims'),
                    api.get('/chat/my-chats'),
                ]);

                setItems(claimedRes.data || []);

                const dMap = {};
                (chatRes.data || []).forEach((c) => {
                    const did = (c.donationId?._id || c.donationId)?.toString();
                    if (did) dMap[did] = c._id;
                });
                setChatMap(dMap);
            } catch (err) {
                console.error('Failed to load requested donations:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Track My Requests</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        See the lifecycle status for every donation item you&apos;ve requested.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Requested Donation Items</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center gap-3 text-slate-500 py-6">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Loading your requested items...</span>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            <p>You haven&apos;t requested any donation items yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {items.map((don) => (
                                <div
                                    key={don._id}
                                    className="rounded-lg border border-slate-200 bg-slate-50/60 p-4"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 truncate">
                                                {don.itemName}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {don.category} • {don.location}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                                            {chatMap[don._id] && (
                                                <Button
                                                    size="xs"
                                                    variant="outline"
                                                    onClick={() => navigate(`/chat/${chatMap[don._id]}`)}
                                                    className="flex items-center gap-1"
                                                >
                                                    <MessageSquare className="h-3 w-3" />
                                                    Chat
                                                </Button>
                                            )}
                                            <Button
                                                size="xs"
                                                variant="ghost"
                                                onClick={() => navigate(`/donations/${don._id}`)}
                                            >
                                                View Detail
                                            </Button>
                                        </div>
                                    </div>
                                    <DonationProgressTracker lifecycleStatus={don.lifecycleStatus || 'posted'} />
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

