import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import ItemCard from '../../components/shared/ItemCard';
import { mockCategories } from '../../services/mockData';
import { Search, Loader2 } from 'lucide-react';
import api from '../../services/api';

export default function RequestsList() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const { data } = await api.get('/requests');
                setRequests(data);
            } catch (err) {
                setError('Failed to load requests. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'All' || req.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [requests, searchTerm, categoryFilter]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Community Requests</h1>
                <p className="text-slate-500 mt-2">Browse requests from your neighbors and see where you can help.</p>
            </div>

            <Card className="mb-8 border-none shadow-sm pb-0">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search requests by keywords..."
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

            {loading ? (
                <div className="flex items-center justify-center py-20 gap-3 text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading requests...</span>
                </div>
            ) : error ? (
                <div className="text-center py-20 text-red-600">
                    <p>{error}</p>
                </div>
            ) : filteredRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredRequests.map(req => (
                        <ItemCard
                            key={req._id}
                            id={req._id}
                            title={req.title}
                            category={req.category}
                            description={req.description}
                            location={req.location}
                            status={req.status}
                            type="request"
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <h3 className="text-lg font-medium text-slate-900">No requests found</h3>
                    <p className="text-slate-500 mt-1">Try adjusting your filters or search terms.</p>
                </div>
            )}
        </div>
    );
}
