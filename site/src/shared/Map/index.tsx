'use client';

// Group all 'leaflet' imports together
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

interface LeafletMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  height?: string;
  width?: string;
}

export default function LeafletMap({
  latitude,
  longitude,
  zoom = 13,
  height = '400px',
  width = '100%',
}: LeafletMapProps) {
  const position = useMemo(
    () => [latitude, longitude] as [number, number],
    [latitude, longitude],
  );

  useEffect(() => {
    const DefaultIcon = L.Icon.Default;
    DefaultIcon.mergeOptions({
      iconRetinaUrl: markerIcon2x.src,
      iconUrl: markerIcon.src,
      shadowUrl: markerShadow.src,
    });
    if (process.env.NODE_ENV === 'development') {
      const mapContainer = L.DomUtil.get('map-container');
      if (mapContainer != null) {
        (mapContainer as any)._leaflet_id = null;
      }
    }
  }, []);

  return (
    <div className="rounded overflow-hidden" style={{ height, width }}>
      <MapContainer
        {...(process.env.NODE_ENV === 'development'
          ? { id: 'map-container' }
          : {})}
        center={position}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            Latitude: {latitude}, Longitude: {longitude}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
