import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Package, ArrowLeft, User, Tag, Layers, Loader2 } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function DonationDetail() {
    const { id } = useParams();
    const { user: authUser } = useAuth();
    const navigate = useNavigate();

    const [donation, setDonation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDonation = async () => {
            try {
                const { data } = await api.get(`/donations/${id}`);
                setDonation(data);
            } catch (err) {
                setError('Donation not found or has been removed.');
            } finally {
                setLoading(false);
            }
        };
        fetchDonation();
    }, [id]);

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'available': return <Badge variant="success">Available</Badge>;
            case 'claimed':   return <Badge variant="default">Claimed</Badge>;
            default:          return <Badge variant="outline">{status}</Badge>;
        }
    };

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
                <Button asChild variant="outline">
                    <Link to="/donations">← Back to Donations</Link>
                </Button>
            </div>
        );
    }

    const donorName = donation.createdBy?.name || 'Anonymous';
    const donorPhone = donation.createdBy?.phone;

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            {/* Back button */}
            <button
                onClick={() => navigate('/donations')}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors mb-6"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Donations
            </button>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
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

            {/* Main details card */}
            <Card className="mb-6 shadow-sm">
                <CardContent className="pt-6 space-y-5">

                    {/* Description */}
                    <div>
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                            Description
                        </h2>
                        <p className="text-slate-700 leading-relaxed">{donation.description || 'No description provided.'}</p>
                    </div>

                    <hr className="border-border/50" />

                    {/* Details grid */}
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

                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-primary-50 p-2">
                                <User className="h-4 w-4 text-primary-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Donated by</p>
                                <p className="text-sm font-medium text-slate-900">{donorName}</p>
                                {donorPhone && (
                                    <p className="text-xs text-slate-500">{donorPhone}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Image */}
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

            {/* Action */}
            {authUser ? (
                <div className="bg-primary-50 border border-primary-100 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <Package className="h-5 w-5 text-primary-600" />
                        <h3 className="font-semibold text-slate-900">Interested in this item?</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">
                        Contact the donor directly to arrange pickup or delivery.
                    </p>
                    {donorPhone ? (
                        <a
                            href={`tel:${donorPhone}`}
                            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                        >
                            Call Donor — {donorPhone}
                        </a>
                    ) : (
                        <p className="text-sm text-slate-500 italic">Donor contact not available.</p>
                    )}
                </div>
            ) : (
                <div className="bg-slate-50 border border-border rounded-xl p-5 text-center">
                    <p className="text-slate-600 mb-3">Sign in to contact the donor.</p>
                    <Button asChild>
                        <Link to="/login">Login to Continue</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
