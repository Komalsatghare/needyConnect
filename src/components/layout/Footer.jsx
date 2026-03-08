import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="border-t border-border bg-slate-50 relative mt-auto">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col items-center md:items-start">
                        <span className="text-xl font-bold text-primary-600">NeedyConnect</span>
                        <p className="text-sm text-slate-500 mt-2 text-center md:text-left">
                            Connecting communities, sharing resources, spreading hope.
                        </p>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link to="/" className="text-sm text-slate-600 hover:text-primary-600">Privacy Policy</Link>
                        <Link to="/" className="text-sm text-slate-600 hover:text-primary-600">Terms of Service</Link>
                        <Link to="/" className="text-sm text-slate-600 hover:text-primary-600">Contact</Link>
                    </div>
                </div>
                <div className="mt-8 text-center text-sm text-slate-400">
                    &copy; {new Date().getFullYear()} NeedyConnect. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
