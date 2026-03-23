import { ShieldCheck, Star } from 'lucide-react';

/**
 * TrustBadge - shows verification badge and trust score.
 * Props:
 *  - isVerified: boolean
 *  - trustScore: number (0-100)
 *  - size: 'sm' | 'md' (default 'md')
 */
export default function TrustBadge({ isVerified, trustScore = 0, size = 'md' }) {
    const isSmall = size === 'sm';

    const scoreColor =
        trustScore >= 75
            ? '#16a34a'   // green
            : trustScore >= 50
            ? '#2563eb'   // blue
            : '#d97706';  // amber

    return (
        <div className={`flex items-center gap-${isSmall ? '1.5' : '3'} flex-wrap`}>
            {isVerified && (
                <span
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)',
                        color: '#fff',
                        borderRadius: '999px',
                        padding: isSmall ? '2px 8px' : '3px 10px',
                        fontSize: isSmall ? '10px' : '12px',
                        fontWeight: 700,
                        letterSpacing: '0.03em',
                        boxShadow: '0 1px 4px rgba(14,165,233,0.25)',
                    }}
                >
                    <ShieldCheck size={isSmall ? 11 : 13} strokeWidth={2.5} />
                    Verified
                </span>
            )}
            {trustScore > 0 && (
                <span
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#f1f5f9',
                        color: scoreColor,
                        borderRadius: '999px',
                        padding: isSmall ? '2px 8px' : '3px 10px',
                        fontSize: isSmall ? '10px' : '12px',
                        fontWeight: 700,
                        border: `1.5px solid ${scoreColor}30`,
                    }}
                >
                    <Star size={isSmall ? 10 : 12} fill={scoreColor} strokeWidth={0} />
                    {trustScore}
                </span>
            )}
        </div>
    );
}
