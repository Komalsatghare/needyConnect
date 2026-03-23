import { CheckCircle2, Circle, PackageOpen, Truck, PartyPopper, HandHeart } from 'lucide-react';

const STAGES = [
    { key: 'posted', label: 'Posted', icon: PackageOpen },
    { key: 'requested', label: 'Requested', icon: HandHeart },
    { key: 'accepted', label: 'Accepted', icon: CheckCircle2 },
    { key: 'delivered', label: 'Delivered', icon: Truck },
    { key: 'completed', label: 'Completed', icon: PartyPopper },
];

export default function DonationProgressTracker({ lifecycleStatus = 'posted' }) {
    const currentIndex = STAGES.findIndex((s) => s.key === lifecycleStatus);

    return (
        <div style={{ padding: '20px 0' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Donation Progress
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
                {/* connector line */}
                <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '10%',
                    right: '10%',
                    height: '3px',
                    background: '#e2e8f0',
                    borderRadius: '4px',
                    zIndex: 0,
                }} />
                <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '10%',
                    width: currentIndex === 0 ? '0%' : `${(currentIndex / (STAGES.length - 1)) * 80}%`,
                    height: '3px',
                    background: 'linear-gradient(90deg, #1d4ed8, #0ea5e9)',
                    borderRadius: '4px',
                    zIndex: 1,
                    transition: 'width 0.6s ease',
                }} />

                {STAGES.map((stage, i) => {
                    const isDone = i < currentIndex;
                    const isCurrent = i === currentIndex;
                    const Icon = stage.icon;
                    return (
                        <div key={stage.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 2 }}>
                            <div style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: isDone
                                    ? 'linear-gradient(135deg, #1d4ed8, #0ea5e9)'
                                    : isCurrent
                                    ? '#fff'
                                    : '#f1f5f9',
                                border: isCurrent ? '2.5px solid #1d4ed8' : isDone ? 'none' : '2px solid #e2e8f0',
                                boxShadow: isCurrent ? '0 0 0 4px rgba(29,78,216,0.12)' : 'none',
                                transition: 'all 0.3s ease',
                            }}>
                                <Icon
                                    size={16}
                                    color={isDone ? '#fff' : isCurrent ? '#1d4ed8' : '#94a3b8'}
                                    strokeWidth={2.5}
                                />
                            </div>
                            <p style={{
                                fontSize: '10px',
                                fontWeight: isCurrent ? 700 : 500,
                                color: isDone ? '#1d4ed8' : isCurrent ? '#0f172a' : '#94a3b8',
                                marginTop: '6px',
                                textAlign: 'center',
                                lineHeight: 1.2,
                            }}>
                                {stage.label}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
