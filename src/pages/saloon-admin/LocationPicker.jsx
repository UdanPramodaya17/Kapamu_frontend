import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, MapPin, Search } from 'lucide-react';
import toast from 'react-hot-toast';

// Default center: Colombo, Sri Lanka
const defaultCenter = {
    lat: 6.927079,
    lng: 79.861244
};

// SVG custom red marker icon to avoid asset resolution errors in bundlers
const customIcon = L.divIcon({
    html: `
        <div style="color: #ef4444; width: 30px; height: 30px;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0z"/>
                <circle cx="12" cy="10" r="3" fill="white"/>
            </svg>
        </div>
    `,
    className: 'custom-leaflet-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 30], // Anchor at bottom center
});

export default function LocationPicker({ onLocationSelect, initialLocation }) {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    
    // Parse coordinates from initialLocation (which can be [lng, lat] or {lat, lng})
    const getInitialCoords = () => {
        if (!initialLocation) return defaultCenter;
        if (Array.isArray(initialLocation)) {
            // [lng, lat] GeoJSON format
            const [lng, lat] = initialLocation;
            if (lat !== 0 || lng !== 0) return { lat, lng };
        } else if (initialLocation.lat && initialLocation.lng) {
            return { lat: initialLocation.lat, lng: initialLocation.lng };
        }
        return defaultCenter;
    };

    const [markerPosition, setMarkerPosition] = useState(getInitialCoords());
    const [address, setAddress] = useState('');
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);

    // Initialise Leaflet Map
    useEffect(() => {
        if (!mapContainerRef.current) return;

        const initialCoords = getInitialCoords();

        // Create Leaflet Map Instance
        const map = L.map(mapContainerRef.current, {
            center: [initialCoords.lat, initialCoords.lng],
            zoom: 15,
            zoomControl: false // Custom controls look cleaner
        });

        // Add standard OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Add Zoom Control at bottom right
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Create marker
        const marker = L.marker([initialCoords.lat, initialCoords.lng], {
            icon: customIcon,
            draggable: true
        }).addTo(map);

        // Save refs
        mapRef.current = map;
        markerRef.current = marker;

        // Perform initial geocode check
        geocodeLocation(initialCoords.lat, initialCoords.lng);

        // Handle Map click to reposition marker
        map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            marker.setLatLng([lat, lng]);
            setMarkerPosition({ lat, lng });
            geocodeLocation(lat, lng);
        });

        // Handle marker dragend to update coords
        marker.on('dragend', (e) => {
            const latLng = e.target.getLatLng();
            setMarkerPosition({ lat: latLng.lat, lng: latLng.lng });
            geocodeLocation(latLng.lat, latLng.lng);
        });

        // Cleanup on unmount
        return () => {
            map.remove();
        };
    }, []);

    // Perform Geocoding (reverse lat/lng to human address) via Nominatim API
    const geocodeLocation = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
                {
                    headers: {
                        'User-Agent': 'SaloonApp/1.0'
                    }
                }
            );
            const data = await response.json();
            if (data && data.display_name) {
                const formattedAddress = data.display_name;
                setAddress(formattedAddress);
                if (onLocationSelect) {
                    onLocationSelect({ lat, lng, address: formattedAddress });
                }
            }
        } catch (error) {
            console.error("Geocoding error: ", error);
        }
    };

    // Address Search via Nominatim API
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
                {
                    headers: {
                        'User-Agent': 'SaloonApp/1.0'
                    }
                }
            );
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const latitude = parseFloat(lat);
                const longitude = parseFloat(lon);

                setMarkerPosition({ lat: latitude, lng: longitude });
                setAddress(display_name);

                if (mapRef.current && markerRef.current) {
                    mapRef.current.setView([latitude, longitude], 15);
                    markerRef.current.setLatLng([latitude, longitude]);
                }

                if (onLocationSelect) {
                    onLocationSelect({ lat: latitude, lng: longitude, address: display_name });
                }
                toast.success('Location found!');
            } else {
                toast.error('Location not found. Please try a different query.');
            }
        } catch (error) {
            console.error("Search error: ", error);
            toast.error('Search failed. Please try again.');
        } finally {
            setSearching(false);
        }
    };

    // Use user Geolocation
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                setMarkerPosition({ lat, lng });

                if (mapRef.current && markerRef.current) {
                    mapRef.current.setView([lat, lng], 16);
                    markerRef.current.setLatLng([lat, lng]);
                }

                geocodeLocation(lat, lng);
                setLoadingLocation(false);
                toast.success("Location identified successfully!");
            },
            (error) => {
                setLoadingLocation(false);
                toast.error("Unable to retrieve your location. Please check browser permissions.");
            }
        );
    };

    return (
        <div className="space-y-4">
            {/* Search and Geolocation bar */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search town, city or street (e.g. Galle, Kandy...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSearch(e);
                                }
                            }}
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-black/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black shadow-sm font-medium text-black placeholder:text-gray-400"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleSearch}
                        disabled={searching}
                        className="bg-black hover:bg-black/80 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm shrink-0"
                    >
                        {searching ? 'Searching...' : 'Search'}
                    </button>
                </div>

                <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={loadingLocation}
                    className="flex items-center gap-2 bg-white hover:bg-gray-50 text-black px-4 py-2.5 rounded-xl text-sm transition-colors border border-black/10 justify-center font-semibold shadow-sm shrink-0"
                >
                    <Crosshair size={16} className={loadingLocation ? "animate-spin text-black" : "text-black"} />
                    {loadingLocation ? 'Finding...' : 'My Location'}
                </button>
            </div>

            {/* Map Container */}
            <div className="border border-black/10 rounded-xl overflow-hidden relative shadow-sm z-0">
                <div 
                    ref={mapContainerRef} 
                    style={{ width: '100%', height: '300px', background: '#e5e7eb' }} 
                />
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-black/5 text-[10px] text-gray-500 font-bold tracking-wide uppercase shadow-sm pointer-events-none select-none z-[1000]">
                    Drag marker or click map to choose location
                </div>
            </div>

            {/* Address display */}
            {address && (
                <div className="flex items-start gap-3 text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-black/5 shadow-inner font-medium">
                    <MapPin size={18} className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Selected Location Address</div>
                        <p className="leading-relaxed font-semibold text-black">{address}</p>
                    </div>
                </div>
            )}
        </div>
    );
}