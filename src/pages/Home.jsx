import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { HeartHandshake, PackageOpen, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthPromptModal from '../components/shared/AuthPromptModal';

export default function Home() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    const handleProtectedClick = (path) => {
        if (user) {
            navigate(path);
        } else {
            setShowModal(true);
        }
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)]">
            {showModal && <AuthPromptModal onClose={() => setShowModal(false)} />}

            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden bg-primary-50">
                <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-[bottom_1px_center]" />
                <div className="container px-4 md:px-6 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-slate-900">
                            Connecting Help with <span className="text-primary-600">Hope</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                            NeedyConnect bridges the gap between those who need assistance and those willing to give.
                            Join our community platform to share resources, offer help, and make a real difference.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-8">
                            <Button
                                size="lg"
                                className="h-12 px-8 text-base"
                                onClick={() => handleProtectedClick('/requests/new')}
                            >
                                Request Help
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-12 px-8 text-base bg-white"
                                onClick={() => handleProtectedClick('/donations/new')}
                            >
                                Donate Resources
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="container px-4 md:px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
                        <p className="mt-4 text-slate-600">A simple, transparent way to support your community.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <Card className="border-none shadow-md bg-slate-50">
                            <CardHeader>
                                <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
                                    <PackageOpen className="h-6 w-6 text-primary-600" />
                                </div>
                                <CardTitle className="text-xl">Share Resources</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-600">Have extra food, clothes, or books? Post a donation offer for someone in need to claim.</p>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-md bg-slate-50">
                            <CardHeader>
                                <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                                    <HeartHandshake className="h-6 w-6 text-emerald-600" />
                                </div>
                                <CardTitle className="text-xl">Request Assistance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-600">Facing a tough time? Create a request for the specific items or help you need right now.</p>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-md bg-slate-50">
                            <CardHeader>
                                <div className="h-12 w-12 rounded-lg bg-secondary-100 flex items-center justify-center mb-4">
                                    <Users className="h-6 w-6 text-secondary-600" />
                                </div>
                                <CardTitle className="text-xl">Build Community</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-600">Connect directly with your neighbors securely to arrange pickups and drop-offs.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Impact Section / CTA */}
            <section className="py-20 bg-slate-900 text-white mt-auto">
                <div className="container px-4 md:px-6 text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to make an impact?</h2>
                    <p className="text-slate-300 mb-8 text-lg">
                        Join hundreds of community members who are currently actively supporting each other every day.
                    </p>
                    <Button asChild size="lg" className="bg-primary-500 hover:bg-primary-600 text-white h-12 px-8">
                        <Link to="/signup">Join NeedyConnect Today</Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}
