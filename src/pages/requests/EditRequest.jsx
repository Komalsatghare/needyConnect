import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { mockCategories } from '../../services/mockData';
import { Loader2 } from 'lucide-react';
import api from '../../services/api';

export default function EditRequest() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '', category: '', description: '', location: '',
    });

    useEffect(() => {
        api.get(`/requests/${id}`)
            .then(({ data }) => setFormData({
                title: data.title || '',
                category: data.category || '',
                description: data.description || '',
                location: data.location || '',
            }))
            .catch(() => setError('Failed to load request.'))
            .finally(() => setFetching(false));
    }, [id]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.put(`/requests/update/${id}`, formData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update request.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <Card className="border-none shadow-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Edit Request</CardTitle>
                    <CardDescription>Update the details of your help request.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">{error}</div>}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Request Title</label>
                            <Input name="title" required value={formData.title} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <Select name="category" required value={formData.category} onChange={handleChange}>
                                <option value="" disabled>Select a category...</option>
                                {mockCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea name="description" className="min-h-[120px]" required value={formData.description} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Location</label>
                            <Input name="location" required value={formData.location} onChange={handleChange} />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-4 border-t border-border pt-6">
                        <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
