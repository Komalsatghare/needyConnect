import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { mockCategories } from '../../services/mockData';
import LocationPicker from '../../components/shared/LocationPicker';
import api from '../../services/api';

export default function PostRequest() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [coordinates, setCoordinates] = useState(null); // [lng, lat] from map picker
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        location: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Called by LocationPicker with (readableAddress, [lng, lat])
    const handleLocationChange = (address, coords) => {
        setFormData((prev) => ({ ...prev, location: address }));
        if (coords) setCoordinates(coords);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const payload = {
                title: formData.title,
                category: formData.category,
                description: formData.description,
                location: formData.location,
                coordinates: coordinates || undefined,
            };
            await api.post('/requests/create', payload);
            navigate('/requests');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <Card className="border-none shadow-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Post a Help Request</CardTitle>
                    <CardDescription>
                        Detail what you need so the community can best assist you. Be specific about items and location.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Request Title <span className="text-secondary-600">*</span></label>
                            <Input
                                name="title"
                                placeholder="e.g. Need winter clothes for a toddler"
                                required
                                value={formData.title}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category <span className="text-secondary-600">*</span></label>
                            <Select name="category" required value={formData.category} onChange={handleChange}>
                                <option value="" disabled>Select a category...</option>
                                {mockCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description <span className="text-secondary-600">*</span></label>
                            <Textarea
                                name="description"
                                placeholder="Describe your situation and exactly what you need. Provide sizes, types, and any other relevant details."
                                className="min-h-[120px]"
                                required
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Location / Area <span className="text-secondary-600">*</span></label>
                            <LocationPicker
                                value={formData.location}
                                onChange={handleLocationChange}
                                required
                                placeholder="e.g. Downtown near Central Park"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-4 border-t border-border pt-6">
                        <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Posting...' : 'Post Request'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
