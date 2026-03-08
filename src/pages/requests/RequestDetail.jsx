import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { mockRequests } from '../../services/mockData';
import { Calendar, MapPin, User, MessageSquare } from 'lucide-react';

export default function RequestDetail() {
    const { id } = useParams();
    const request = mockRequests.find(r => r.id === id);

    if (!request) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold">Request not found</h2>
                <Button asChild className="mt-4">
                    <Link to="/requests">Back to Requests</Link>
                </Button>
            </div>
        );
    }

    const getStatusBadge = (status) => {
        switch (status.toLowerCase()) {
            case 'pending': return <Badge variant="warning">Pending</Badge>;
            case 'accepted': return <Badge variant="success">Accepted</Badge>;
            case 'completed': return <Badge variant="default">Completed</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link to="/requests" className="text-sm font-medium text-slate-500 hover:text-primary-600 mb-6 inline-block">
                &larr; Back to Requests
            </Link>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-none shadow-md">
                        <CardHeader className="border-b border-border/50 pb-6">
                            <div className="flex justify-between items-start gap-4 mb-4">
                                <Badge variant="outline" className="text-primary-700 bg-primary-50">
                                    {request.category}
                                </Badge>
                                {getStatusBadge(request.status)}
                            </div>
                            <CardTitle className="text-3xl">{request.title}</CardTitle>
                            <div className="flex flex-wrap gap-4 mt-6 text-sm text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <User className="h-4 w-4" />
                                    {request.user.name}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(request.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4" />
                                    {request.location}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 prose prose-slate">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Description</h3>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {request.description}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-none shadow-md sticky top-24">
                        <CardHeader>
                            <CardTitle className="text-lg">Can you help?</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-slate-600">
                                If you have the resources to fulfill this request, please reach out to the requester.
                            </p>
                            <Button className="w-full flex items-center gap-2" size="lg">
                                <MessageSquare className="h-4 w-4" />
                                Contact Requester
                            </Button>
                            <Button variant="outline" className="w-full" size="lg">
                                Mark as Followed
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
