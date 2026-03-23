import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { MapPin, List, SlidersHorizontal, Navigation, Loader2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { mockCategories } from '../services/mockData';
import TrustBadge from '../components/shared/TrustBadge';

// Fix Leaflet default icon paths broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Blue dot for user location
const userIcon = new L.DivIcon({
    className: '',
    html: `<div style="width:16px;height:16px;background:#1d4ed8;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(29,78,216,0.5);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
});

// Donation item pin
const donationIcon = (isVerified) => new L.DivIcon({
    className: '',
    html: `<div style="
        width:32px;height:32px;
        background:${isVerified ? 'linear-gradient(135deg,#1d4ed8,#0ea5e9)' : 'linear-gradient(135deg,#7c3aed,#a855f7)'};
        border:2.5px solid #fff;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 3px 10px rgba(0,0,0,0.2);
    "></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

function FlyToUser({ coords }) {
    const map = useMap();
    useEffect(() => {
        if (coords) map.flyTo([coords[1], coords[0]], 13, { animate: true, duration: 1.2 });
    }, [coords, map]);
    return null;
}

const RADII = [5, 10, 20];

export default function MapView() {
    const navigate = useNavigate();
    const [userCoords, setUserCoords] = useState(null); // [lng, lat]
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState('');
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [radius, setRadius] = useState(10);
    const [category, setCategory] = useState('All');
    const [showFilters, setShowFilters] = useState(false);

    const getLocation = () => {
        setLocationLoading(true);
        setLocationError('');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = [pos.coords.longitude, pos.coords.latitude];
                setUserCoords(coords);
                setLocationLoading(false);
            },
            () => {
                setLocationError('Could not get your location. Please enable location access.');
                setLocationLoading(false);
            }
        );
    };

    useEffect(() => { getLocation(); }, []);

    useEffect(() => {
        if (!userCoords) return;
        setLoading(true);
        api.get('/donations/nearby', {
            params: { lat: userCoords[1], lng: userCoords[0], radius },
        })
            .then(({ data }) => setDonations(data))
            .catch(() => setDonations([]))
            .finally(() => setLoading(false));
    }, [userCoords, radius]);

    const filteredDonations = category === 'All'
        ? donations
        : donations.filter((d) => d.category === category);

    const defaultCenter = userCoords ? [userCoords[1], userCoords[0]] : [20.5937, 78.9629]; // India center

    return (
        <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {/* Top Controls Bar */}
            <div style={{
                position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)',
                zIndex: 1000, display: 'flex', gap: '8px', alignItems: 'center',
            }}>
                {/* Location button */}
                <button
                    onClick={getLocation}
                    disabled={locationLoading}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                        borderRadius: '999px', background: '#fff', border: '1.5px solid #e2e8f0',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)', cursor: 'pointer', fontSize: '13px',
                        fontWeight: 600, color: '#1d4ed8',
                    }}>
                    {locationLoading ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                    My Location
                </button>

                {/* Filters toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                        borderRadius: '999px', background: showFilters ? '#1d4ed8' : '#fff',
                        border: '1.5px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                        color: showFilters ? '#fff' : '#374151',
                    }}>
                    <SlidersHorizontal size={14} />
                    Filters
                </button>

                {/* List view */}
                <button
                    onClick={() => navigate('/donations')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                        borderRadius: '999px', background: '#fff', border: '1.5px solid #e2e8f0',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)', cursor: 'pointer', fontSize: '13px',
                        fontWeight: 600, color: '#374151',
                    }}>
                    <List size={14} />
                    List View
                </button>
            </div>

            {/* Filters panel */}
            {showFilters && (
                <div style={{
                    position: 'absolute', top: '62px', left: '50%', transform: 'translateX(-50%)',
                    zIndex: 1000, background: '#fff', borderRadius: '16px', padding: '16px 20px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0',
                    display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap',
                }}>
                    <div>
                        <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Radius</p>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {RADII.map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRadius(r)}
                                    style={{
                                        padding: '4px 12px', borderRadius: '999px', fontSize: '13px',
                                        fontWeight: 600, cursor: 'pointer', border: '1.5px solid',
                                        borderColor: radius === r ? '#1d4ed8' : '#e2e8f0',
                                        background: radius === r ? '#eff6ff' : '#fff',
                                        color: radius === r ? '#1d4ed8' : '#64748b',
                                    }}
                                >{r}km</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Category</p>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            style={{
                                padding: '5px 10px', borderRadius: '8px', border: '1.5px solid #e2e8f0',
                                fontSize: '13px', color: '#0f172a', outline: 'none', cursor: 'pointer',
                            }}
                        >
                            <option value="All">All Categories</option>
                            {mockCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            )}

            {/* Location error */}
            {locationError && (
                <div style={{
                    position: 'absolute', top: '62px', left: '50%', transform: 'translateX(-50%)',
                    zIndex: 1000, background: '#fef2f2', border: '1px solid #fecaca',
                    borderRadius: '10px', padding: '10px 16px', display: 'flex', alignItems: 'center',
                    gap: '8px', color: '#dc2626', fontSize: '13px', fontWeight: 500,
                }}>
                    <AlertCircle size={14} />
                    {locationError}
                </div>
            )}

            {/* Count badge */}
            {!loading && userCoords && (
                <div style={{
                    position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                    zIndex: 1000, background: '#0f172a', color: '#fff', borderRadius: '999px',
                    padding: '8px 20px', fontSize: '13px', fontWeight: 600,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                }}>
                    <MapPin size={13} style={{ display: 'inline', marginRight: '6px', opacity: 0.7 }} />
                    {filteredDonations.length} donation{filteredDonations.length !== 1 ? 's' : ''} within {radius}km
                </div>
            )}

            {/* Map */}
            <MapContainer
                center={defaultCenter}
                zoom={12}
                style={{ flex: 1, width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {userCoords && <FlyToUser coords={userCoords} />}

                {/* User location marker */}
                {userCoords && (
                    <>
                        <Marker position={[userCoords[1], userCoords[0]]} icon={userIcon}>
                            <Popup>📍 You are here</Popup>
                        </Marker>
                        <Circle
                            center={[userCoords[1], userCoords[0]]}
                            radius={radius * 1000}
                            pathOptions={{ color: '#1d4ed8', fillColor: '#1d4ed8', fillOpacity: 0.06, weight: 1.5, dashArray: '6 4' }}
                        />
                    </>
                )}

                {/* Donation markers */}
                {filteredDonations.map((d) => {
                    if (!d.coordinates?.coordinates) return null;
                    const [lng, lat] = d.coordinates.coordinates;
                    return (
                        <Marker
                            key={d._id}
                            position={[lat, lng]}
                            icon={donationIcon(d.createdBy?.isVerified)}
                        >
                            <Popup maxWidth={240} minWidth={220}>
                                <div style={{ fontFamily: 'inherit', padding: '4px 0' }}>
                                    {d.image && (
                                        <img
                                            src={d.image}
                                            alt={d.itemName}
                                            style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }}
                                        />
                                    )}
                                    <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', color: '#0f172a' }}>{d.itemName}</p>
                                    <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>{d.category}</p>
                                    {d.distance && (
                                        <p style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: 600, marginBottom: '8px' }}>
                                            📍 {d.distance} km away
                                        </p>
                                    )}
                                    {d.createdBy && (
                                        <div style={{ marginBottom: '8px' }}>
                                            <TrustBadge isVerified={d.createdBy.isVerified} trustScore={d.createdBy.trustScore} size="sm" />
                                        </div>
                                    )}
                                    <button
                                        onClick={() => navigate(`/donations/${d._id}`)}
                                        style={{
                                            width: '100%', padding: '7px', borderRadius: '8px', border: 'none',
                                            background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)', color: '#fff',
                                            fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                                        }}
                                    >
                                        Request Item
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {loading && (
                <div style={{
                    position: 'absolute', top: '62px', right: '16px', zIndex: 1000,
                    background: '#fff', borderRadius: '10px', padding: '8px 14px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '13px', color: '#64748b', fontWeight: 500,
                }}>
                    <Loader2 size={13} className="animate-spin" />
                    Loading nearby donations...
                </div>
            )}
        </div>
    );
}
