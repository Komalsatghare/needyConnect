import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import ItemCard from '../../components/shared/ItemCard';
import { mockCategories } from '../../services/mockData';
import { Search, Loader2, Map, LocateFixed } from 'lucide-react';
import api from '../../services/api';

export default function DonationsList() {
    const navigate = useNavigate();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [nearbyMode, setNearbyMode] = useState(false);
    const [nearbyLoading, setNearbyLoading] = useState(false);

    // Fetch all donations initially
    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const { data } = await api.get('/donations');
                setDonations(data);
            } catch (err) {
                setError('Failed to load donations. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchDonations();
    }, []);

    // Fetch nearby when toggled
    const handleNearbyToggle = async () => {
        if (nearbyMode) {
            setNearbyMode(false);
            setLoading(true);
            try {
                const { data } = await api.get('/donations');
                setDonations(data);
            } catch {}
            finally { setLoading(false); }
            return;
        }

        setNearbyLoading(true);
        try {
            const coords = await new Promise((resolve, reject) =>
                navigator.geolocation.getCurrentPosition(
                    (pos) => resolve([pos.coords.longitude, pos.coords.latitude]),
                    reject
                )
            );
            const { data } = await api.get('/donations/nearby', {
                params: { lat: coords[1], lng: coords[0], radius: 10 },
            });
            setDonations(data);
            setNearbyMode(true);
        } catch {
            setError('Could not get your location. Please enable location permissions.');
        } finally {
            setNearbyLoading(false);
        }
    };

    const filteredDonations = useMemo(() => {
        return donations.filter(don => {
            const matchesSearch = don.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                don.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'All' || don.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [donations, searchTerm, categoryFilter]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Available Donations</h1>
                    <p className="text-slate-500 mt-1">Browse items offered by your community.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleNearbyToggle}
                        disabled={nearbyLoading}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 600,
                            border: '1.5px solid', cursor: 'pointer',
                            borderColor: nearbyMode ? '#1d4ed8' : '#e2e8f0',
                            background: nearbyMode ? '#eff6ff' : '#fff',
                            color: nearbyMode ? '#1d4ed8' : '#374151',
                            transition: 'all 0.2s',
                        }}
                    >
                        {nearbyLoading ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
                        {nearbyMode ? 'Nearby (10km)' : 'Nearby'}
                    </button>
                    <button
                        onClick={() => navigate('/map')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 600,
                            border: '1.5px solid #e2e8f0', cursor: 'pointer',
                            background: '#fff', color: '#374151',
                        }}
                    >
                        <Map size={14} /> Map View
                    </button>
                </div>
            </div>

            <Card className="mb-8 border-none shadow-sm pb-0">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search donations by keywords..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-64 shrink-0">
                            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                                <option value="All">All Categories</option>
                                {mockCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {nearbyMode && (
                <p className="text-sm text-blue-600 font-medium mb-4 flex items-center gap-1.5">
                    <LocateFixed size={13} /> Showing {filteredDonations.length} donations within 10 km of your location
                </p>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20 gap-3 text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading donations...</span>
                </div>
            ) : error ? (
                <div className="text-center py-20 text-red-600">
                    <p>{error}</p>
                </div>
            ) : filteredDonations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredDonations.map(don => (
                        <ItemCard
                            key={don._id}
                            id={don._id}
                            title={don.itemName}
                            category={don.category}
                            description={don.description}
                            location={don.location}
                            status={don.lifecycleStatus}
                            type="donation"
                            quantity={don.quantity}
                            distance={don.distance}
                            isVerified={don.createdBy?.isVerified}
                            trustScore={don.createdBy?.trustScore}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <h3 className="text-lg font-medium text-slate-900">No donations found</h3>
                    <p className="text-slate-500 mt-1">Check back later or adjust your search filters.</p>
                </div>
            )}
        </div>
    );
}
