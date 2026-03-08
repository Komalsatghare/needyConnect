import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthPromptModal from './AuthPromptModal';

export default function ItemCard({
    id,
    title,
    category,
    description,
    location,
    status,
    type = 'request',
    quantity
}) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    const getStatusBadge = (status) => {
        switch (status.toLowerCase()) {
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
                <CardHeader className="pb-4">
                    <div className="flex justify-between items-start gap-4">
                        <CardTitle className="line-clamp-1 group-hover:text-primary-600 transition-colors">
                            {title}
                        </CardTitle>
                        {status && getStatusBadge(status)}
                    </div>
                    <CardDescription className="flex items-center gap-2 mt-2">
                        {getCategoryBadge(category)}
                        {quantity && <span className="text-xs font-medium text-slate-500">Qty: {quantity}</span>}
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex-grow">
                    <p className="text-sm text-slate-600 line-clamp-3 mb-4">{description}</p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-auto">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{location}</span>
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
