import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Notification({ type = 'info', title, message, onClose }) {
    const icons = {
        info: <Info className="h-5 w-5 text-blue-500" />,
        success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
        warning: <AlertCircle className="h-5 w-5 text-amber-500" />,
        error: <XCircle className="h-5 w-5 text-red-500" />
    };

    return (
        <div className={cn(
            "w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 relative",
            "transition-all duration-300 ease-in-out border-l-4",
            {
                "border-l-blue-500": type === 'info',
                "border-l-emerald-500": type === 'success',
                "border-l-amber-500": type === 'warning',
                "border-l-red-500": type === 'error',
            }
        )}>
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        {icons[type]}
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-slate-900">{title}</p>
                        <p className="mt-1 text-sm text-slate-500">{message}</p>
                    </div>
                    {onClose && (
                        <div className="ml-4 flex flex-shrink-0">
                            <button
                                type="button"
                                className="inline-flex rounded-md bg-white text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                onClick={onClose}
                            >
                                <span className="sr-only">Close</span>
                                <XCircle className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
