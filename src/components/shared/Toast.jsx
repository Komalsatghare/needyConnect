import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, X, Info, Bell } from 'lucide-react';

const ICONS = {
    success: <CheckCircle2 size={18} color="#16a34a" />,
    error: <AlertCircle size={18} color="#dc2626" />,
    info: <Info size={18} color="#1d4ed8" />,
    notification: <Bell size={18} color="#7c3aed" />,
};

const COLORS = {
    success: { bg: '#f0fdf4', border: '#86efac', text: '#14532d', bar: '#16a34a' },
    error:   { bg: '#fef2f2', border: '#fca5a5', text: '#7f1d1d', bar: '#dc2626' },
    info:    { bg: '#eff6ff', border: '#93c5fd', text: '#1e3a5f', bar: '#1d4ed8' },
    notification: { bg: '#faf5ff', border: '#d8b4fe', text: '#3b0764', bar: '#7c3aed' },
};

let toastEmitter = null;

export function toast(message, type = 'success', duration = 4000) {
    if (toastEmitter) toastEmitter({ message, type, duration, id: Date.now() });
}

export function ToastProvider() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        toastEmitter = (t) => setToasts((prev) => [...prev, t]);
        return () => { toastEmitter = null; };
    }, []);

    const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

    return (
        <div style={{
            position: 'fixed', bottom: '24px', right: '24px',
            zIndex: 99999, display: 'flex', flexDirection: 'column', gap: '10px',
            pointerEvents: 'none',
        }}>
            {toasts.map((t) => (
                <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
            ))}
        </div>
    );
}

function ToastItem({ toast: t, onClose }) {
    const c = COLORS[t.type] || COLORS.info;
    const [visible, setVisible] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        // Animate in
        requestAnimationFrame(() => setVisible(true));
        // Auto-dismiss
        timerRef.current = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 350);
        }, t.duration || 4000);
        return () => clearTimeout(timerRef.current);
    }, []);

    return (
        <div
            style={{
                pointerEvents: 'all',
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                background: c.bg, border: `1.5px solid ${c.border}`,
                borderRadius: '14px', padding: '14px 16px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                minWidth: '300px', maxWidth: '380px', position: 'relative', overflow: 'hidden',
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
                opacity: visible ? 1 : 0,
                transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
        >
            <div style={{ flexShrink: 0, marginTop: '1px' }}>{ICONS[t.type] || ICONS.info}</div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: c.text, flex: 1, lineHeight: 1.5 }}>
                {t.message}
            </p>
            <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.text, opacity: 0.5, padding: '2px', flexShrink: 0 }}
            >
                <X size={14} />
            </button>
            {/* Progress bar */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, height: '3px',
                background: c.bar, borderRadius: '0 0 14px 14px',
                animation: `toast-shrink ${t.duration || 4000}ms linear forwards`,
            }} />
            <style>{`@keyframes toast-shrink { from { width: 100%; } to { width: 0%; } }`}</style>
        </div>
    );
}
