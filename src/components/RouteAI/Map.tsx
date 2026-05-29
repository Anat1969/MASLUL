import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Trip, POICategory } from '../../types/routes';

interface MapProps {
  activeTrip: Trip;
  activeDayFilter: number;
  activeCategoryFilter: POICategory | 'all';
  mapInstanceRef: React.MutableRefObject<L.Map | null>;
}

const getCategoryStyles = (category: string) => {
  switch (category) {
    case 'hotel':
      return { color: '#B45309', bg: '#FEF3C7', icon: '🏨' };
    case 'restaurant':
      return { color: '#047857', bg: '#D1FAE5', icon: '🍴' };
    case 'attraction':
      return { color: '#1D4ED8', bg: '#DBEAFE', icon: '🏛️' };
    default:
      return { color: '#78350F', bg: '#FFEDD5', icon: '🧭' };
  }
};

export default function Map({
  activeTrip,
  activeDayFilter,
  activeCategoryFilter,
  mapInstanceRef,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(containerRef.current, {
        zoomControl: false,
      }).setView([46.0, 11.5], 8);

      // Add tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(mapInstanceRef.current);

      // Add zoom control
      L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Clear markers
    Object.values(markersRef.current).forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = {};

    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    // Filter POIs
    const filteredPois = activeTrip.pois.filter(poi => {
      const matchDay = activeDayFilter === 0 || poi.dayNumber === activeDayFilter;
      const matchCat = activeCategoryFilter === 'all' || poi.category === activeCategoryFilter;
      return matchDay && matchCat;
    });

    const coordinates: L.LatLngExpression[] = [];

    // Add markers
    filteredPois.forEach((poi) => {
      if (poi.latitude && poi.longitude) {
        const lat = parseFloat(String(poi.latitude));
        const lng = parseFloat(String(poi.longitude));
        coordinates.push([lat, lng]);

        const styles = getCategoryStyles(poi.category);

        const customIcon = L.divIcon({
          className: 'custom-poi-icon',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-125">
              <div class="absolute -inset-1 rounded-full bg-white/40 blur-sm"></div>
              <div class="z-10 flex h-9 w-9 items-center justify-center rounded-full shadow-lg border-2 border-white" style="background-color: ${styles.color};">
                <span class="text-sm">${styles.icon}</span>
              </div>
              <div class="absolute -bottom-1 h-2 w-2 rotate-45 border-r border-b border-white" style="background-color: ${styles.color};"></div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36],
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

        const popupContent = `
          <div class="text-right p-1 font-sans" dir="rtl">
            <span class="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full" style="background-color: ${styles.bg}; color: ${styles.color}">
              יום ${poi.dayNumber} • ${
                poi.category === 'hotel' ? 'לינה' :
                poi.category === 'restaurant' ? 'קולינריה' :
                poi.category === 'attraction' ? 'אטרקציה' :
                'נקודת מעבר'
              }
            </span>
            <h4 class="font-serif text-sm font-extrabold text-stone-950 mt-1.5">${poi.name}</h4>
            <p class="text-xs text-stone-600 mt-1 leading-relaxed">${poi.description || 'אין תיאור זמין.'}</p>
            <p class="text-[10px] text-stone-400 mt-1.5 font-mono">📍 ${poi.locationName}</p>
          </div>
        `;

        marker.bindPopup(popupContent);
        markersRef.current[poi.id] = marker;
      }
    });

    // Draw polyline
    const sortedLineCoords = [...activeTrip.pois]
      .filter(poi => poi.latitude && poi.longitude)
      .sort((a, b) => a.dayNumber - b.dayNumber)
      .map(poi => [parseFloat(String(poi.latitude)), parseFloat(String(poi.longitude))]);

    if (sortedLineCoords.length > 1) {
      polylineRef.current = L.polyline(sortedLineCoords as L.LatLngExpression[], {
        color: '#C2843E',
        weight: 2,
        opacity: 0.6,
        dashArray: '5, 8',
        lineJoin: 'round',
      }).addTo(map);
    }

    // Fit bounds
    if (coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [activeTrip, activeDayFilter, activeCategoryFilter, mapInstanceRef]);

  return (
    <>
      {/* Legend */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-stone-200/60 max-w-[280px] pointer-events-auto" dir="rtl">
        <span className="text-[9px] font-bold text-stone-400 tracking-wider uppercase">תצוגת דרך פעילה</span>
        <h3 className="font-serif text-xs font-bold text-stone-900 mt-0.5">{activeTrip.title}</h3>
        <div className="mt-2 text-[10px] text-stone-500 space-y-1">
          <div className="flex items-center gap-1.5"><span>🏨</span> <span>צהוב - מלונות ולינה</span></div>
          <div className="flex items-center gap-1.5"><span>🍴</span> <span>ירוק - קולינריה ומסעדות</span></div>
          <div className="flex items-center gap-1.5"><span>🏛️</span> <span>כחול - אטרקציות וביקור</span></div>
        </div>
      </div>

      {/* Map Container */}
      <div id="map-container" ref={containerRef} className="w-full h-full z-0" />
    </>
  );
}
