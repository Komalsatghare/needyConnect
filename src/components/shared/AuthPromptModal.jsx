import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { LogIn, UserPlus, X } from 'lucide-react';

export default function AuthPromptModal({ onClose }) {
    const navigate = useNavigate();

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
                    aria-label="Close"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Icon */}
                <div className="flex items-center justify-center mb-5">
                    <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                        <LogIn className="h-8 w-8 text-primary-600" />
                    </div>
                </div>

                {/* Text */}
                <div className="text-center mb-7">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        Sign in to continue
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Please log in to help or request an item.
                        <br />
                        Join our community and make a difference today!
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-3">
                    <Button
                        className="w-full h-11 gap-2"
                        onClick={() => { onClose(); navigate('/login'); }}
                    >
                        <LogIn className="h-4 w-4" />
                        Log In
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full h-11 gap-2"
                        onClick={() => { onClose(); navigate('/signup'); }}
                    >
                        <UserPlus className="h-4 w-4" />
                        Create an Account
                    </Button>
                </div>
            </div>
        </div>
    );
}
