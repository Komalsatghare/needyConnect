import { useState } from 'react';
import { Flag, X, Loader2 } from 'lucide-react';
import api from '../../services/api';

const REASONS = [
    { value: 'fake_donation', label: 'Fake / misleading donation' },
    { value: 'fraudulent_request', label: 'Fraudulent request' },
    { value: 'inappropriate_content', label: 'Inappropriate content' },
    { value: 'suspicious_user', label: 'Suspicious user' },
    { value: 'spam', label: 'Spam' },
    { value: 'other', label: 'Other' },
];

/**
 * ReportModal props:
 * - onClose: () => void
 * - reportedUser: userId string (optional)
 * - donation: donationId string (optional)
 */
export default function ReportModal({ onClose, reportedUser, donation }) {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason) { setError('Please select a reason.'); return; }
        if (!description.trim()) { setError('Please provide a description.'); return; }

        setLoading(true);
        setError('');

        try {
            await api.post('/reports', { reportedUser, donation, reason, description });
            setSuccess(true);
            setTimeout(onClose, 1800);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        }}>
            <div style={{
                background: '#fff', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                width: '100%', maxWidth: '440px', padding: '28px',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ background: '#fef2f2', borderRadius: '8px', padding: '6px' }}>
                            <Flag size={18} color="#dc2626" />
                        </div>
                        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Report Content</h2>
                    </div>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                        <X size={20} />
                    </button>
                </div>

                {success ? (
                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
                        <p style={{ fontWeight: 600, color: '#16a34a', fontSize: '15px' }}>Report submitted successfully!</p>
                        <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Our team will review it shortly.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', marginBottom: '16px' }}>
                                {error}
                            </div>
                        )}

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
                                Reason *
                            </label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                style={{
                                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                                    border: '1.5px solid #e2e8f0', fontSize: '14px', color: '#0f172a',
                                    outline: 'none', background: '#f8fafc', cursor: 'pointer',
                                }}
                            >
                                <option value="">Select a reason</option>
                                {REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
                                Description *
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the issue in detail..."
                                maxLength={1000}
                                rows={4}
                                style={{
                                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                                    border: '1.5px solid #e2e8f0', fontSize: '14px', color: '#0f172a',
                                    outline: 'none', background: '#f8fafc', resize: 'vertical',
                                    fontFamily: 'inherit', boxSizing: 'border-box',
                                }}
                            />
                            <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right', marginTop: '4px' }}>{description.length}/1000</p>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="button" onClick={onClose} style={{
                                flex: 1, padding: '10px', borderRadius: '8px', border: '1.5px solid #e2e8f0',
                                background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '14px',
                            }}>
                                Cancel
                            </button>
                            <button type="submit" disabled={loading} style={{
                                flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #dc2626, #ef4444)',
                                color: '#fff', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            }}>
                                {loading ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : 'Submit Report'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
