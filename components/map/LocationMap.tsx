'use client';

import { useEffect, useRef } from 'react';
import { LocationRecord } from '@/types';

interface LocationMapProps {
  locations: LocationRecord[];
  sessionTitle?: string;
}

export default function LocationMap({ locations, sessionTitle }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      if (!mapRef.current) return;

      if (!leafletInstance.current) {
        const initialLat = locations.length > 0 ? locations[0].latitude : -6.2088;
        const initialLng = locations.length > 0 ? locations[0].longitude : 106.8456;
        const zoom = locations.length > 0 ? 15 : 4;

        const map = L.map(mapRef.current, {
          center: [initialLat, initialLng],
          zoom: zoom,
          attributionControl: false
        });

        // Standard OpenStreetMap tiles (no API key required)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        leafletInstance.current = map;
        markersLayerRef.current = L.layerGroup().addTo(map);
      }

      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();

        if (locations.length > 0) {
          const bounds = L.latLngBounds([]);

          locations.forEach((loc, index) => {
            const latlng: [number, number] = [loc.latitude, loc.longitude];
            bounds.extend(latlng);

            const isLatest = index === 0;

            const customIcon = L.divIcon({
              className: 'custom-map-pin',
              html: `
                <div class="relative flex items-center justify-center">
                  ${isLatest ? '<div class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></div>' : ''}
                  <div class="w-6 h-6 rounded-full ${isLatest ? 'bg-blue-600 border-2 border-white' : 'bg-slate-700 border-2 border-white'} shadow-md flex items-center justify-center text-[11px] font-bold text-white">
                    ${locations.length - index}
                  </div>
                </div>
              `,
              iconSize: [26, 26],
              iconAnchor: [13, 13]
            });

            const marker = L.marker(latlng, { icon: customIcon });

            const timeStr = new Date(loc.created_at || loc.timestamp).toLocaleString();
            const popupHtml = `
              <div class="p-1 space-y-1 font-sans text-xs">
                <div class="font-semibold text-blue-600 border-b border-slate-200 pb-1">
                  ${isLatest ? '📍 Lokasi Terakhir' : `Update #${locations.length - index}`}
                </div>
                <div class="text-slate-700"><strong>Waktu:</strong> ${timeStr}</div>
                <div class="text-slate-700"><strong>Latitude:</strong> ${loc.latitude.toFixed(6)}</div>
                <div class="text-slate-700"><strong>Longitude:</strong> ${loc.longitude.toFixed(6)}</div>
                <div class="text-slate-700"><strong>Akurasi:</strong> ~${Math.round(loc.accuracy)} meter</div>
              </div>
            `;

            marker.bindPopup(popupHtml);
            markersLayerRef.current.addLayer(marker);

            if (loc.accuracy && loc.accuracy < 5000) {
              const circle = L.circle(latlng, {
                radius: loc.accuracy,
                color: isLatest ? '#2563eb' : '#64748b',
                fillColor: isLatest ? '#3b82f6' : '#94a3b8',
                fillOpacity: 0.15,
                weight: 1.5
              });
              markersLayerRef.current.addLayer(circle);
            }
          });

          if (locations.length > 1) {
            leafletInstance.current.fitBounds(bounds, { padding: [40, 40] });
          } else {
            leafletInstance.current.setView([locations[0].latitude, locations[0].longitude], 15);
          }
        }
      }
    });

    return () => {
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, [locations]);

  return (
    <div className="relative w-full h-[450px] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <div ref={mapRef} className="w-full h-full" />
      {locations.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm z-[1000] p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-3 text-slate-500">
            📍
          </div>
          <h4 className="text-slate-800 font-semibold text-sm mb-1">Menunggu Berbagi Lokasi</h4>
          <p className="text-xs text-slate-500 max-w-sm">
            Belum ada pembaruan lokasi. Saat penerima menyetujui izin lokasi, titik lokasi akan muncul otomatis di peta ini.
          </p>
        </div>
      )}
    </div>
  );
}
