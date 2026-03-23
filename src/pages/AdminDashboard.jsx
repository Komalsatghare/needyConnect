import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Package, Flag, ShieldCheck, ShieldX, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const TAB = { REPORTS: 'reports', USERS: 'users', DONATIONS: 'donations' };

const REPORT_REASON_LABELS = {
    fake_donation: 'Fake Donation',
    fraudulent_request: 'Fraudulent Request',
    inappropriate_content: 'Inappropriate Content',
    suspicious_user: 'Suspicious User',
    spam: 'Spam',
    other: 'Other',
};

export default function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(TAB.REPORTS);
    const [reports, setReports] = useState([]);
    const [users, setUsers] = useState([]);
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    // Redirect non-admins
    useEffect(() => {
        if (user && user.role !== 'admin') navigate('/dashboard');
    }, [user, navigate]);

    // Load data for the active tab
    useEffect(() => {
        setLoading(true);
        const endpoints = {
            [TAB.REPORTS]: '/reports',
            [TAB.USERS]: '/admin/users',
            [TAB.DONATIONS]: '/admin/donations',
        };
        api.get(endpoints[activeTab])
            .then(({ data }) => {
                if (activeTab === TAB.REPORTS) setReports(data);
                else if (activeTab === TAB.USERS) setUsers(data);
                else setDonations(data);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [activeTab]);

    const handleAction = async (action, ...args) => {
        const key = `${action}-${args[0]}`;
        setActionLoading(key);
        try {
            if (action === 'verify') await api.patch(`/admin/users/${args[0]}/verify`);
            else if (action === 'suspend') await api.patch(`/admin/users/${args[0]}/suspend`);
            else if (action === 'unsuspend') await api.patch(`/admin/users/${args[0]}/unsuspend`);
            else if (action === 'delete-donation') await api.delete(`/admin/donations/${args[0]}`);
            else if (action === 'report-status') await api.patch(`/reports/${args[0]}/status`, { status: args[1] });

            // Refresh the tab
            const endpoints = { [TAB.REPORTS]: '/reports', [TAB.USERS]: '/admin/users', [TAB.DONATIONS]: '/admin/donations' };
            const { data } = await api.get(endpoints[activeTab]);
            if (activeTab === TAB.REPORTS) setReports(data);
            else if (activeTab === TAB.USERS) setUsers(data);
            else setDonations(data);
        } catch {}
        finally { setActionLoading(null); }
    };

    const tabStyle = (tab) => ({
        padding: '8px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', border: 'none',
        background: activeTab === tab ? '#1d4ed8' : 'transparent',
        color: activeTab === tab ? '#fff' : '#64748b',
        transition: 'all 0.2s',
    });

    const btnStyle = (color = 'blue') => ({
        padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
        cursor: 'pointer', border: 'none',
        background: color === 'green' ? '#dcfce7' : color === 'red' ? '#fee2e2' : color === 'amber' ? '#fef9c3' : '#dbeafe',
        color: color === 'green' ? '#16a34a' : color === 'red' ? '#dc2626' : color === 'amber' ? '#92400e' : '#1d4ed8',
    });

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                <div style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)', borderRadius: '12px', padding: '10px' }}>
                    <ShieldCheck size={22} color="#fff" />
                </div>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Admin Dashboard</h1>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>Moderate content, manage users, review reports</p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', marginBottom: '24px', width: 'fit-content' }}>
                <button style={tabStyle(TAB.REPORTS)} onClick={() => setActiveTab(TAB.REPORTS)}>
                    <Flag size={13} style={{ display: 'inline', marginRight: '5px' }} />
                    Reports ({reports.length})
                </button>
                <button style={tabStyle(TAB.USERS)} onClick={() => setActiveTab(TAB.USERS)}>
                    <Users size={13} style={{ display: 'inline', marginRight: '5px' }} />
                    Users ({users.length})
                </button>
                <button style={tabStyle(TAB.DONATIONS)} onClick={() => setActiveTab(TAB.DONATIONS)}>
                    <Package size={13} style={{ display: 'inline', marginRight: '5px' }} />
                    Donations ({donations.length})
                </button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: '#94a3b8' }}>
                    <Loader2 size={28} className="animate-spin" />
                </div>
            ) : (
                <>
                    {/* Reports Tab */}
                    {activeTab === TAB.REPORTS && (
                        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            {reports.length === 0 ? (
                                <p style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No reports yet.</p>
                            ) : reports.map((r) => (
                                <div key={r._id} style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: '200px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span style={{ background: '#fff7ed', color: '#c2410c', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', border: '1px solid #fed7aa' }}>
                                                {REPORT_REASON_LABELS[r.reason] || r.reason}
                                            </span>
                                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                {new Date(r.createdAt).toLocaleDateString()}
                                            </span>
                                            <span style={{ background: r.status === 'pending' ? '#fef9c3' : r.status === 'resolved' ? '#dcfce7' : '#dbeafe', color: r.status === 'pending' ? '#92400e' : r.status === 'resolved' ? '#16a34a' : '#1d4ed8', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>
                                                {r.status}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '13px', color: '#374151', marginBottom: '4px' }}>{r.description}</p>
                                        <p style={{ fontSize: '11px', color: '#64748b' }}>
                                            Reporter: <strong>{r.reporter?.name}</strong>
                                            {r.reportedUser && <> · Reported: <strong>{r.reportedUser?.name}</strong></>}
                                            {r.donation && <> · Item: <strong>{r.donation?.itemName}</strong></>}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                        {r.status === 'pending' && (
                                            <button disabled={!!actionLoading} onClick={() => handleAction('report-status', r._id, 'reviewed')} style={btnStyle('blue')}>
                                                Mark Reviewed
                                            </button>
                                        )}
                                        {r.status !== 'resolved' && (
                                            <button disabled={!!actionLoading} onClick={() => handleAction('report-status', r._id, 'resolved')} style={btnStyle('green')}>
                                                Resolve
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === TAB.USERS && (
                        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            {users.length === 0 ? (
                                <p style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No users found.</p>
                            ) : users.map((u) => (
                                <div key={u._id} style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: '180px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{u.name}</p>
                                            {u.isVerified && <CheckCircle2 size={13} color="#16a34a" />}
                                            {u.suspended && <AlertTriangle size={13} color="#dc2626" />}
                                        </div>
                                        <p style={{ fontSize: '12px', color: '#64748b' }}>{u.email} · {u.role} · Trust: {u.trustScore}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                        {!u.isVerified && (
                                            <button disabled={actionLoading === `verify-${u._id}`} onClick={() => handleAction('verify', u._id)} style={btnStyle('green')}>
                                                {actionLoading === `verify-${u._id}` ? '...' : 'Verify'}
                                            </button>
                                        )}
                                        {!u.suspended ? (
                                            <button disabled={actionLoading === `suspend-${u._id}`} onClick={() => handleAction('suspend', u._id)} style={btnStyle('red')}>
                                                {actionLoading === `suspend-${u._id}` ? '...' : 'Suspend'}
                                            </button>
                                        ) : (
                                            <button disabled={actionLoading === `unsuspend-${u._id}`} onClick={() => handleAction('unsuspend', u._id)} style={btnStyle('blue')}>
                                                {actionLoading === `unsuspend-${u._id}` ? '...' : 'Unsuspend'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Donations Tab */}
                    {activeTab === TAB.DONATIONS && (
                        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            {donations.length === 0 ? (
                                <p style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No donations found.</p>
                            ) : donations.map((d) => (
                                <div key={d._id} style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: '200px' }}>
                                        <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{d.itemName}</p>
                                        <p style={{ fontSize: '12px', color: '#64748b' }}>
                                            {d.category} · By: {d.createdBy?.name}
                                            {d.createdBy?.isVerified && <> · <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ Verified</span></>}
                                        </p>
                                    </div>
                                    <button
                                        disabled={actionLoading === `delete-donation-${d._id}`}
                                        onClick={() => handleAction('delete-donation', d._id)}
                                        style={btnStyle('red')}
                                    >
                                        {actionLoading === `delete-donation-${d._id}` ? '...' : 'Delete Post'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
