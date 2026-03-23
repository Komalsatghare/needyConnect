import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { User, Mail, Phone, Settings, ShieldCheck, Loader2, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TrustBadge from '../components/shared/TrustBadge';
import api from '../services/api';

export default function Profile() {
    const { user: authUser, login, token } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({ name: '', phone: '', location: '' });

    // Load fresh profile from API
    useEffect(() => {
        api.get('/auth/profile').then(({ data }) => {
            setProfile(data);
            setFormData({ name: data.name, phone: data.phone, location: data.location || '' });
        }).catch(() => {});
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await api.put('/auth/profile', formData);
            setProfile(data);
            setFormData({ name: data.name, phone: data.phone, location: data.location || '' });
            // Update auth context so navbar name updates
            login({ ...authUser, name: data.name }, data.token || token);
            setIsEditing(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save changes.');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestVerification = async () => {
        setVerifyLoading(true);
        try {
            await api.post('/auth/request-verification');
            setProfile((prev) => ({ ...prev, verificationRequested: true }));
        } catch {}
        finally { setVerifyLoading(false); }
    };

    const displayProfile = profile || authUser;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex items-center justify-between mb-8 text-slate-900">
                <h1 className="text-3xl font-bold">My Profile</h1>
                {saved && <span style={{ color: '#16a34a', fontSize: '13px', fontWeight: 600 }}>✓ Changes saved!</span>}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Left: Avatar + trust */}
                <div className="md:col-span-1 border-none bg-slate-50">
                    <Card className="border-none shadow-sm flex flex-col items-center p-6 text-center">
                        <div style={{
                            width: '88px', height: '88px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '12px', boxShadow: '0 4px 16px rgba(29,78,216,0.25)',
                        }}>
                            <User size={36} color="#fff" />
                        </div>
                        <h2 className="text-xl font-bold">{displayProfile?.name}</h2>
                        <p className="text-sm text-slate-500 mb-3 capitalize">{displayProfile?.role}</p>

                        {/* Trust badges */}
                        <div style={{ marginBottom: '16px' }}>
                            <TrustBadge isVerified={displayProfile?.isVerified} trustScore={displayProfile?.trustScore} />
                        </div>

                        {/* Stats */}
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', width: '100%', justifyContent: 'center' }}>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '20px', fontWeight: 800, color: '#1d4ed8' }}>{displayProfile?.completedDonations || 0}</p>
                                <p style={{ fontSize: '11px', color: '#64748b' }}>Donations</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '20px', fontWeight: 800, color: '#1d4ed8' }}>{displayProfile?.trustScore || 50}</p>
                                <p style={{ fontSize: '11px', color: '#64748b' }}>Trust Score</p>
                            </div>
                        </div>

                        {/* Verification request */}
                        {!displayProfile?.isVerified && (
                            displayProfile?.verificationRequested ? (
                                <p style={{ fontSize: '12px', color: '#64748b', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px' }}>
                                    ⏳ Verification request pending
                                </p>
                            ) : (
                                <button
                                    onClick={handleRequestVerification}
                                    disabled={verifyLoading}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px',
                                        fontWeight: 600, color: '#1d4ed8', background: '#eff6ff', border: '1.5px solid #bfdbfe',
                                        borderRadius: '8px', padding: '7px 12px', cursor: 'pointer', width: '100%', justifyContent: 'center',
                                    }}
                                >
                                    <ShieldCheck size={13} />
                                    {verifyLoading ? 'Requesting...' : 'Apply for Verified Badge'}
                                </button>
                            )
                        )}

                        {!isEditing && (
                            <Button variant="outline" className="w-full flex items-center gap-2 mt-3" onClick={() => setIsEditing(true)}>
                                <Settings className="w-4 h-4" /> Edit Profile
                            </Button>
                        )}
                    </Card>
                </div>

                {/* Right: Edit form */}
                <div className="md:col-span-2">
                    <Card className="border-none shadow-sm w-full">
                        <CardHeader className="border-b border-border/50">
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Manage your contact details and account settings.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-6 pt-6">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">{error}</div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input id="name" value={formData.name} onChange={handleChange} disabled={!isEditing} className="pl-9" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input value={displayProfile?.email || ''} disabled className="pl-9 opacity-60" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Contact Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} disabled={!isEditing} className="pl-9" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input id="location" value={formData.location} onChange={handleChange} disabled={!isEditing} className="pl-9" placeholder="City, Country" />
                                    </div>
                                </div>
                            </CardContent>
                            {isEditing && (
                                <CardFooter className="flex justify-end gap-3 pt-4 border-t border-border">
                                    <Button type="button" variant="outline" onClick={() => { setIsEditing(false); setError(''); }}>Cancel</Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : 'Save Changes'}
                                    </Button>
                                </CardFooter>
                            )}
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
