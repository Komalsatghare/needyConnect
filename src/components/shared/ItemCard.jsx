import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthPromptModal from './AuthPromptModal';
import TrustBadge from './TrustBadge';

export default function ItemCard({
    id,
    title,
    category,
    description,
    location,
    status,
    type = 'request',
    quantity,
    distance,
    isVerified,
    trustScore,
}) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return <Badge variant="warning">Pending</Badge>;
            case 'accepted': return <Badge variant="success">Accepted</Badge>;
            case 'completed': return <Badge variant="default">Completed</Badge>;
            case 'available': return <Badge variant="success">Available</Badge>;
            case 'claimed': return <Badge variant="default">Claimed</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getCategoryBadge = (category) => (
        <Badge variant="outline" className="text-primary-700 bg-primary-50 border-primary-200">
            {category}
        </Badge>
    );

    const handleActionClick = () => {
        if (user) {
            navigate(`/${type}s/${id}`);
        } else {
            setShowModal(true);
        }
    };

    return (
        <>
            {showModal && <AuthPromptModal onClose={() => setShowModal(false)} />}
            <Card className="flex flex-col h-full hover:shadow-md transition-shadow group">
                <CardHeader
                    className="pb-4 cursor-pointer"
                    onClick={handleActionClick}
                >
                    <div className="flex justify-between items-start gap-4">
                        <CardTitle className="line-clamp-1 group-hover:text-primary-600 transition-colors">
                            {title}
                        </CardTitle>
                        {status && getStatusBadge(status)}
                    </div>
                    <CardDescription className="flex items-center gap-2 mt-2 flex-wrap">
                        {getCategoryBadge(category)}
                        {quantity && <span className="text-xs font-medium text-slate-500">Qty: {quantity}</span>}
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex-grow cursor-pointer" onClick={handleActionClick}>
                    <p className="text-sm text-slate-600 line-clamp-3 mb-3">{description}</p>

                    {/* Trust info */}
                    {(isVerified !== undefined || trustScore !== undefined) && (
                        <div className="mb-3">
                            <TrustBadge isVerified={isVerified} trustScore={trustScore} size="sm" />
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate max-w-[140px]">{location}</span>
                        </div>
                        {distance && (
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                {distance} km
                            </span>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="pt-4 border-t border-border/50">
                    <Button
                        className="w-full"
                        variant={type === 'request' ? 'default' : 'outline'}
                        onClick={handleActionClick}
                    >
                        {type === 'request' ? 'Help Now' : 'Request Item'}
                    </Button>
                </CardFooter>
            </Card>
        </>
    );
}
