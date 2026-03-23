import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Loader2, X, Check } from 'lucide-react';

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom pulse marker for selected position
const selectedIcon = new L.DivIcon({
    className: '',
    html: `
      <div style="position:relative;width:32px;height:32px;">
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
          width:32px;height:32px;background:rgba(29,78,216,0.18);border-radius:50%;
          animation:pulse 1.5s ease-out infinite;"></div>
        <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);
          width:28px;height:28px;background:linear-gradient(135deg,#1d4ed8,#0ea5e9);
          border:3px solid #fff;border-radius:50% 50% 50% 0;rotate:-45deg;
          box-shadow:0 3px 12px rgba(29,78,216,0.4);"></div>
      </div>
      <style>@keyframes pulse{0%{transform:translate(-50%,-50%) scale(0.8);opacity:0.8}100%{transform:translate(-50%,-50%) scale(2);opacity:0;}}</style>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
});

// Reverse-geocode using Nominatim (free, no key required)
async function reverseGeocode(lat, lng) {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        const addr = data.address;
        const parts = [
            addr.neighbourhood || addr.suburb || addr.road,
            addr.city || addr.town || addr.village || addr.county,
            addr.state,
            addr.country,
        ].filter(Boolean);
        return parts.join(', ');
    } catch {
        return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
}

// Inner map component — handles click to move marker
function DraggableMarker({ position, onMove }) {
    useMapEvents({
        click(e) {
            onMove([e.latlng.lat, e.latlng.lng]);
        },
    });
    if (!position) return null;
    return (
        <Marker
            position={position}
            icon={selectedIcon}
            draggable
            eventHandlers={{
                dragend(e) {
                    const { lat, lng } = e.target.getLatLng();
                    onMove([lat, lng]);
                },
            }}
        />
    );
}

function FlyTo({ coords }) {
    const map = useMap();
    useEffect(() => {
        if (coords) map.flyTo(coords, 15, { animate: true, duration: 1 });
    }, [coords, map]);
    return null;
}

/**
 * LocationPicker — props:
 *  - value: string (readable address currently in the text input)
 *  - onChange: (readableAddress: string, coordinates: [lng, lat]) => void
 *  - label: string (optional, default "Location")
 *  - required: bool
 *  - placeholder: string
 */
export default function LocationPicker({
    value,
    onChange,
    label = 'Location',
    required = false,
    placeholder = 'Click to pick on map or use live GPS',
}) {
    const [mapOpen, setMapOpen] = useState(false);
    const [markerPos, setMarkerPos] = useState(null); // [lat, lng]
    const [geocoding, setGeocoding] = useState(false);
    const [gpsLoading, setGpsLoading] = useState(false);
    const [pendingAddress, setPendingAddress] = useState('');
    const [pendingCoords, setPendingCoords] = useState(null);

    // When marker moves, reverse-geocode quietly
    const handleMarkerMove = useCallback(async ([lat, lng]) => {
        setMarkerPos([lat, lng]);
        setGeocoding(true);
        const addr = await reverseGeocode(lat, lng);
        setPendingAddress(addr);
        setPendingCoords([lng, lat]); // store as [lng, lat] for GeoJSON
        setGeocoding(false);
    }, []);

    const handleGPS = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }
        setGpsLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setMarkerPos([lat, lng]);
                setGeocoding(true);
                const addr = await reverseGeocode(lat, lng);
                setPendingAddress(addr);
                setPendingCoords([lng, lat]);
                setGeocoding(false);
                setGpsLoading(false);
            },
            () => {
                alert('Could not get your location. Please allow location access.');
                setGpsLoading(false);
            }
        );
    };

    const handleConfirm = () => {
        if (pendingAddress && pendingCoords) {
            onChange(pendingAddress, pendingCoords);
        }
        setMapOpen(false);
    };

    const handleOpen = () => {
        // Pre-seed the pending address with whatever is in the text box
        setPendingAddress(value || '');
        setPendingCoords(null);
        setMarkerPos(null);
        setMapOpen(true);
    };

    const defaultCenter = markerPos || [20.5937, 78.9629]; // India center fallback

    return (
        <div style={{ position: 'relative' }}>
            {/* Styled text input with pick-on-map button */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <MapPin
                        size={15}
                        color="#94a3b8"
                        style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                    />
                    <input
                        type="text"
                        required={required}
                        value={value}
                        onChange={(e) => onChange(e.target.value, null)}
                        placeholder={placeholder}
                        style={{
                            width: '100%',
                            padding: '9px 12px 9px 36px',
                            borderRadius: '8px',
                            border: '1.5px solid #e2e8f0',
                            fontSize: '14px',
                            color: '#0f172a',
                            outline: 'none',
                            background: '#fff',
                            boxSizing: 'border-box',
                            fontFamily: 'inherit',
                        }}
                        onFocus={e => e.target.style.borderColor = '#1d4ed8'}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                </div>
                <button
                    type="button"
                    onClick={handleOpen}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '9px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                        background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)',
                        color: '#fff', border: 'none', cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(29,78,216,0.25)',
                        whiteSpace: 'nowrap', flexShrink: 0,
                    }}
                >
                    <MapPin size={14} />
                    Pick on Map
                </button>
            </div>

            {/* If a location is confirmed, show a small green pill */}
            {value && (
                <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={11} strokeWidth={3} /> {value}
                </p>
            )}

            {/* Map Modal */}
            {mapOpen && (
                <div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
                    }}
                    onClick={(e) => { if (e.target === e.currentTarget) setMapOpen(false); }}
                >
                    <div style={{
                        background: '#fff', borderRadius: '20px',
                        width: '100%', maxWidth: '680px',
                        boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
                        overflow: 'hidden', display: 'flex', flexDirection: 'column',
                    }}>
                        {/* Modal header */}
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ background: 'linear-gradient(135deg,#1d4ed8,#0ea5e9)', borderRadius: '10px', padding: '7px' }}>
                                    <MapPin size={16} color="#fff" />
                                </div>
                                <div>
                                    <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>Pick Your Location</p>
                                    <p style={{ color: '#64748b', fontSize: '12px' }}>Click on the map or drag the pin to adjust</p>
                                </div>
                            </div>
                            <button onClick={() => setMapOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* GPS button */}
                        <div style={{ padding: '10px 16px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                onClick={handleGPS}
                                disabled={gpsLoading}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '7px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 600,
                                    background: '#fff', border: '1.5px solid #1d4ed8', color: '#1d4ed8', cursor: 'pointer',
                                    boxShadow: '0 1px 4px rgba(29,78,216,0.1)',
                                }}
                            >
                                {gpsLoading ? <Loader2 size={13} className="animate-spin" /> : <Navigation size={13} />}
                                {gpsLoading ? 'Detecting...' : 'Use My Live GPS'}
                            </button>
                            {geocoding && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#64748b' }}>
                                    <Loader2 size={11} className="animate-spin" /> Identifying address...
                                </span>
                            )}
                            {pendingAddress && !geocoding && (
                                <span style={{ fontSize: '12px', color: '#374151', background: '#eff6ff', padding: '4px 10px', borderRadius: '999px', border: '1px solid #bfdbfe' }}>
                                    📍 {pendingAddress}
                                </span>
                            )}
                        </div>

                        {/* Map */}
                        <div style={{ height: '360px', position: 'relative' }}>
                            <MapContainer
                                center={defaultCenter}
                                zoom={markerPos ? 15 : 5}
                                style={{ height: '100%', width: '100%' }}
                                zoomControl
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <FlyTo coords={markerPos} />
                                <DraggableMarker position={markerPos} onMove={handleMarkerMove} />
                            </MapContainer>

                            {/* Hint overlay (when no marker placed yet) */}
                            {!markerPos && (
                                <div style={{
                                    position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)',
                                    zIndex: 1000, background: 'rgba(15,23,42,0.85)', color: '#fff',
                                    borderRadius: '999px', padding: '6px 16px', fontSize: '12px', fontWeight: 500,
                                    pointerEvents: 'none', backdropFilter: 'blur(4px)',
                                }}>
                                    👆 Tap anywhere to drop a pin
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #f1f5f9' }}>
                            <button
                                type="button"
                                onClick={() => setMapOpen(false)}
                                style={{ padding: '8px 20px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={!pendingAddress || geocoding}
                                style={{
                                    padding: '8px 24px', borderRadius: '8px', border: 'none',
                                    background: (!pendingAddress || geocoding) ? '#94a3b8' : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)',
                                    color: '#fff', fontWeight: 600, cursor: (!pendingAddress || geocoding) ? 'not-allowed' : 'pointer',
                                    fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px',
                                    boxShadow: (!pendingAddress || geocoding) ? 'none' : '0 2px 8px rgba(29,78,216,0.3)',
                                }}
                            >
                                <Check size={14} strokeWidth={2.5} />
                                Confirm Location
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
