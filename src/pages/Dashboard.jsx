import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Activity, Gift, HandHeart, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Dashboard() {
    const { user } = useAuth();
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyData = async () => {
            try {
                const { data } = await api.get('/requests/my');
                setMyRequests(data);
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyData();
    }, []);

    const requestsPosted = myRequests.length;
    const activeRequests = myRequests.filter(r => r.status === 'pending').length;

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Welcome, {user?.name?.split(' ')[0]}!
                    </h1>
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
                        <CardTitle className="text-sm font-medium text-slate-600">Account Type</CardTitle>
                        <Gift className="h-4 w-4 text-secondary-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-secondary-900 capitalize">
                            {user?.role || '—'}
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
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>My Requests</CardTitle>
                        <Link
                            to="/my-chats"
                            className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                        >
                            View My Chats →
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center gap-3 text-slate-500 py-4">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Loading your requests...</span>
                        </div>
                    ) : myRequests.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <p>You haven't posted any requests yet.</p>
                            <Button asChild className="mt-4">
                                <Link to="/requests/new">Post Your First Request</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myRequests.slice(0, 10).map((req) => (
                                <div key={req._id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="mt-0.5 rounded-full p-2 bg-primary-100 text-primary-600">
                                        <HandHeart className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">{req.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {req.category} • {req.location}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize shrink-0 ${
                                        req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                        req.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                        'bg-slate-100 text-slate-600'
                                    }`}>
                                        {req.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
