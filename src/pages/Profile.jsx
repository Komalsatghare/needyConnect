import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { mockUser } from '../services/mockData';
import { User, Mail, Phone, Settings } from 'lucide-react';

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: mockUser.name,
        email: mockUser.email,
        phone: mockUser.phone,
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate updating profile
        setIsEditing(false);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex items-center justify-between mb-8 text-slate-900">
                <h1 className="text-3xl font-bold">My Profile</h1>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1 border-none bg-slate-50">
                    <Card className="border-none shadow-sm flex flex-col items-center p-6 text-center">
                        <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-sm flex items-center justify-center mb-4">
                            <User className="w-12 h-12 text-slate-400" />
                        </div>
                        <h2 className="text-xl font-bold">{formData.name}</h2>
                        <p className="text-sm text-slate-500 mb-6 flex items-center justify-center gap-2">Member since Mar 2026</p>

                        {!isEditing && (
                            <Button variant="outline" className="w-full flex items-center gap-2" onClick={() => setIsEditing(true)}>
                                <Settings className="w-4 h-4" /> Edit Profile
                            </Button>
                        )}
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <Card className="border-none shadow-sm w-full">
                        <CardHeader className="border-b border-border/50">
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Manage your contact details and account settings.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-6 pt-6">
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
                                        <Input id="email" type="email" value={formData.email} onChange={handleChange} disabled={!isEditing} className="pl-9" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Contact Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} disabled={!isEditing} className="pl-9" />
                                    </div>
                                </div>
                            </CardContent>
                            {isEditing && (
                                <CardFooter className="flex justify-end gap-3 pt-4 border-t border-border">
                                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                    <Button type="submit">Save Changes</Button>
                                </CardFooter>
                            )}
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
