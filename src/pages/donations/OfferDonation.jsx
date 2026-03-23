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

export default function OfferDonation() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [coordinates, setCoordinates] = useState(null); // [lng, lat]
    const [formData, setFormData] = useState({
        itemName: '',
        category: '',
        quantity: 1,
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
            await api.post('/donations/create', {
                ...formData,
                quantity: Number(formData.quantity),
                coordinates: coordinates || undefined,
            });
            navigate('/donations');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post donation. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <Card className="border-none shadow-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Offer a Donation</CardTitle>
                    <CardDescription>
                        Help your community by sharing surplus items. Detail what you have to offer and where it can be picked up.
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
                            <label className="text-sm font-medium">Item Name <span className="text-secondary-600">*</span></label>
                            <Input
                                name="itemName"
                                placeholder="e.g. Set of 3 winter coats (Adult M)"
                                required
                                value={formData.itemName}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
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
                                <label className="text-sm font-medium">Quantity <span className="text-secondary-600">*</span></label>
                                <Input
                                    name="quantity"
                                    type="number"
                                    min="1"
                                    required
                                    value={formData.quantity}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description <span className="text-secondary-600">*</span></label>
                            <Textarea
                                name="description"
                                placeholder="Describe the condition, sizes, or any other relevant details about the items."
                                className="min-h-[120px]"
                                required
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Pickup Location <span className="text-secondary-600">*</span></label>
                            <LocationPicker
                                value={formData.location}
                                onChange={handleLocationChange}
                                required
                                placeholder="e.g. Westside Community Center Lobby"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-4 border-t border-border pt-6">
                        <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Posting...' : 'Offer Donation'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
