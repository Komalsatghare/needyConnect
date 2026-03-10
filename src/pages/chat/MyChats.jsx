import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { MessageSquare, Loader2, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function MyChats() {
    const { user } = useAuth();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const { data } = await api.get('/chat/my-chats');
                setChats(data);
            } catch (err) {
                console.error('Failed to fetch chats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchChats();
    }, []);

    const getOtherUser = (chat) => {
        const myId = user?._id?.toString();
        const helperId = (chat.helperId?._id || chat.helperId)?.toString();
        return helperId === myId ? chat.needyUserId : chat.helperId;
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900">My Chats</h1>
                <p className="text-slate-500 mt-1">All your active conversations.</p>
            </div>

            <Card className="border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary-600" />
                        <CardTitle>Conversations</CardTitle>
                    </div>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                        {chats.length} conversation{chats.length !== 1 ? 's' : ''}
                    </span>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center gap-3 text-slate-500 py-8">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Loading your chats...</span>
                        </div>
                    ) : chats.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                            <p className="text-sm font-medium">No chats yet</p>
                            <p className="text-xs mt-1 text-slate-400">
                                Chats are created when someone accepts a request.
                            </p>
                            <Link
                                to="/requests"
                                className="inline-block mt-4 text-sm text-primary-600 hover:underline"
                            >
                                Browse Requests →
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {chats.map((chat) => {
                                const other = getOtherUser(chat);
                                const preview = chat.lastMessage?.content;
                                const time = chat.lastMessage?.createdAt
                                    ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                      })
                                    : null;

                                return (
                                    <Link
                                        key={chat._id}
                                        to={`/chat/${chat._id}`}
                                        className="flex items-center gap-4 py-3 px-2 hover:bg-slate-50 rounded-lg transition-colors group"
                                    >
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                            <span className="text-primary-700 font-bold text-base">
                                                {other?.name?.[0]?.toUpperCase() || '?'}
                                            </span>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <p className="font-semibold text-slate-900 text-sm truncate">
                                                    {other?.name || 'User'}
                                                </p>
                                                {time && (
                                                    <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                                                        {time}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 truncate">
                                                {preview ? (
                                                    preview.length > 60 ? preview.slice(0, 60) + '…' : preview
                                                ) : (
                                                    <span className="italic">
                                                        Re: {chat.requestId?.title || 'a request'}
                                                    </span>
                                                )}
                                            </p>
                                        </div>

                                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary-500 transition-colors flex-shrink-0" />
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
