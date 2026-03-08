import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Signup() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'needy',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match.");
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: formData.role,
            });
            login(
                { _id: data._id, name: data.name, email: data.email, phone: data.phone, role: data.role },
                data.token
            );
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50 py-12">
            <Card className="w-full max-w-md shadow-lg border-none">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
                    <CardDescription>
                        Join NeedyConnect to start helping and requesting resources.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="name">Full Name</label>
                            <Input id="name" placeholder="John Doe" required value={formData.name} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="email">Email</label>
                            <Input id="email" type="email" placeholder="m@example.com" required value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="phone">Phone Number</label>
                            <Input id="phone" type="tel" placeholder="(555) 123-4567" required value={formData.phone} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="role">I am a...</label>
                            <Select id="role" value={formData.role} onChange={handleChange}>
                                <option value="needy">Someone who needs help (Needy)</option>
                                <option value="donor">Someone who wants to help (Donor)</option>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="password">Password</label>
                            <Input id="password" type="password" required value={formData.password} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="confirmPassword">Confirm Password</label>
                            <Input id="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full h-11" type="submit" disabled={loading}>
                            {loading ? 'Creating account...' : 'Register'}
                        </Button>
                        <div className="text-sm text-center text-slate-500">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-600 font-medium hover:underline">
                                Sign in
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
