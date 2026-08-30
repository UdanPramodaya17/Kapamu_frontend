import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Default center: Colombo, Sri Lanka
const defaultCenter = [6.927079, 79.861244];

// SVG custom black marker icon to match the theme
const customIcon = L.divIcon({
    html: `
        <div style="color: #000000; width: 30px; height: 30px;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0z"/>
                <circle cx="12" cy="10" r="3" fill="white"/>
            </svg>
        </div>
    `,
    className: 'custom-leaflet-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
});

export default function SaloonsMap({ saloons }) {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Filter saloons with valid coordinates
        const validSaloons = saloons.filter(s => 
            s.location?.coordinates && 
            s.location.coordinates[0] !== 0 && 
            s.location.coordinates[1] !== 0
        );

        // Find center coordinates
        let center = defaultCenter;
        let zoom = 12;

        if (validSaloons.length > 0) {
            const totalCoords = validSaloons.reduce(
                (acc, s) => {
                    acc.lat += s.location.coordinates[1];
                    acc.lng += s.location.coordinates[0];
                    return acc;
                },
                { lat: 0, lng: 0 }
            );
            center = [totalCoords.lat / validSaloons.length, totalCoords.lng / validSaloons.length];
            zoom = validSaloons.length === 1 ? 14 : 12;
        }

        // Initialize Map
        const map = L.map(mapContainerRef.current, {
            center: center,
            zoom: zoom,
            zoomControl: false
        });

        // Add OSM Tile Layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Add markers for all valid saloons
        const markerGroup = L.featureGroup();

        validSaloons.forEach(s => {
            const lat = s.location.coordinates[1];
            const lng = s.location.coordinates[0];

            const marker = L.marker([lat, lng], { icon: customIcon });

            // Premium Styled Popup Content
            const popupContent = `
                <div style="font-family: 'Plus Jakarta Sans', sans-serif; width: 220px; padding: 4px; text-align: left;">
                    ${s.coverImage ? `
                        <div style="height: 110px; width: 100%; border-radius: 8px; overflow: hidden; margin-bottom: 8px;">
                            <img src="${s.coverImage}" style="width: 100%; height: 100%; object-fit: cover;" />
                        </div>
                    ` : ''}
                    <h4 style="font-weight: 800; font-size: 14px; margin: 0 0 4px 0; color: #000000; line-height: 1.2;">${s.name}</h4>
                    <div style="display: flex; align-items: center; gap: 4px; font-size: 11px; color: #d97706; font-weight: 700; margin-bottom: 6px;">
                        ★ ${s.rating > 0 ? s.rating.toFixed(1) : '0.0'} (${s.totalReviews || 0} reviews)
                    </div>
                    <div style="font-size: 11px; color: rgba(0,0,0,0.5); font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 3px;">
                        📍 ${s.address?.street ? s.address.street + ', ' : ''}${s.address?.city || 'Colombo'}
                    </div>
                    <a href="/saloons/${s._id}" style="display: block; text-align: center; background: #000000; color: #ffffff; padding: 7px 10px; border-radius: 8px; text-decoration: none; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; transition: opacity 0.2s;">
                        View details
                    </a>
                </div>
            `;

            marker.bindPopup(popupContent);
            marker.addTo(map);
            markerGroup.addLayer(marker);
        });

        // Add all markers to map
        markerGroup.addTo(map);

        // Adjust bounds to show all markers if there are multiple saloons
        if (validSaloons.length > 1) {
            map.fitBounds(markerGroup.getBounds(), { padding: [50, 50] });
        }

        mapRef.current = map;

        return () => {
            map.remove();
        };
    }, [saloons]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '550px', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' }} className="z-0">
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%', background: '#fafafa' }} />
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl border border-black/5 text-xs text-black font-semibold shadow-md pointer-events-none z-[1000] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block"></span>
                <span>Showing {saloons.filter(s => s.location?.coordinates && s.location.coordinates[0] !== 0).length} Salons on Map</span>
            </div>
        </div>
    );
}
