import { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchPlanesInBounds, Plane } from '../services/opensky';
import { Plane as PlaneIcon, Navigation, Activity, Globe, Clock } from 'lucide-react';
import { FlightTable } from './FlightTable';
import { FlightDetails } from './FlightDetails';
import { getCountryFlag } from '../utils/flags';

const createPlaneIcon = (rotation: number) => {
  // Adjust rotation because the lucide plane icon points top-right (45 deg)
  const adjustedRotation = rotation - 45;
  return L.divIcon({
    html: `<div style="transform: rotate(${adjustedRotation}deg); display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#2563eb" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 4-4 4-2.5-.5L1 17l4 2 2 4 .5-1.5-.5-2.5 4-4 4 6 1.8-.7c.4-.2.7-.6.6-1.1z"/></svg>
           </div>`,
    className: 'plane-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

function MapEvents({ onBoundsChange }: { onBoundsChange: (bounds: L.LatLngBounds) => void }) {
  const map = useMapEvents({
    moveend: () => {
      onBoundsChange(map.getBounds());
    },
    zoomend: () => {
      onBoundsChange(map.getBounds());
    },
  });

  useEffect(() => {
    onBoundsChange(map.getBounds());
  }, [map, onBoundsChange]);

  return null;
}

export function FlightMap() {
  const [planes, setPlanes] = useState<Plane[]>([]);
  const [selectedPlane, setSelectedPlane] = useState<Plane | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const boundsRef = useRef<L.LatLngBounds | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRefs = useRef<{ [key: string]: L.Marker }>({});

  const fetchPlanes = useCallback(async () => {
    if (!boundsRef.current) return;
    
    const bounds = boundsRef.current;
    const lamin = Math.max(-90, bounds.getSouth());
    const lomin = Math.max(-180, bounds.getWest());
    const lamax = Math.min(90, bounds.getNorth());
    const lomax = Math.min(180, bounds.getEast());

    if (lomin > lomax) {
      setError('Please pan the map to a valid area');
      setPlanes([]);
      return;
    }

    // Don't fetch if the area is too large to avoid overloading the API and browser
    const latDiff = lamax - lamin;
    const lonDiff = lomax - lomin;
    if (latDiff > 45 || lonDiff > 45) {
      setError('Zoom in to see live flights (area too large)');
      setPlanes([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchPlanesInBounds(lamin, lomin, lamax, lomax);
      setPlanes(data);
      setLastUpdated(new Date());
      setSelectedPlane(prev => {
        if (!prev) return null;
        const updated = data.find(p => p.icao24 === prev.icao24);
        return updated || prev;
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch flight data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch immediately when bounds change, then every 10 seconds
    if (boundsRef.current) {
      fetchPlanes();
    }
    
    timerRef.current = setInterval(() => {
      fetchPlanes();
    }, 10000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [fetchPlanes]);

  const handleBoundsChange = useCallback((bounds: L.LatLngBounds) => {
    boundsRef.current = bounds;
    fetchPlanes();
  }, [fetchPlanes]);

  const handlePlaneClick = useCallback((plane: Plane) => {
    setSelectedPlane(plane);
    if (mapRef.current && plane.latitude && plane.longitude) {
      mapRef.current.flyTo([plane.latitude, plane.longitude], 10, {
        duration: 1.5
      });
      
      // Open the popup for the selected plane after flying to it
      setTimeout(() => {
        const marker = markerRefs.current[plane.icao24];
        if (marker) {
          marker.openPopup();
        }
      }, 1500);
    }
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col md:flex-row">
      <div className="flex-1 relative z-0 h-[50vh] md:h-full">
        {/* Header / Status Bar */}
        <div className="absolute top-4 left-4 right-4 z-[1000] flex justify-between items-start pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20 pointer-events-auto max-w-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-xl">
                <PlaneIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight">Global Flight Tracker</h1>
                <p className="text-sm text-slate-500 font-medium">Live OpenSky Data</p>
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Activity className="w-4 h-4" /> Status
                </span>
                <span className="font-medium text-slate-900">
                  {loading ? 'Updating...' : 'Live'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Navigation className="w-4 h-4" /> Visible Planes
                </span>
                <span className="font-medium text-slate-900">{planes.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Last Update
                </span>
                <span className="font-medium text-slate-900">
                  {lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--:--'}
                </span>
              </div>
            </div>

            {error && (
              <div className="mt-3 p-2 bg-red-50 text-red-600 text-xs font-medium rounded-lg border border-red-100">
                {error}
              </div>
            )}
          </div>
        </div>

        <MapContainer 
          center={[51.505, -0.09]} 
          zoom={6} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          ref={mapRef}
        >
          <ZoomControl position="bottomright" />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <MapEvents onBoundsChange={handleBoundsChange} />
          
          {planes.map((plane) => (
            plane.latitude && plane.longitude ? (
              <Marker
                key={plane.icao24}
                position={[plane.latitude, plane.longitude]}
                icon={createPlaneIcon(plane.true_track || 0)}
                ref={(ref) => {
                  if (ref) {
                    markerRefs.current[plane.icao24] = ref;
                  } else {
                    delete markerRefs.current[plane.icao24];
                  }
                }}
              >
                <Popup className="flight-popup">
                  <div className="p-1 min-w-[200px]">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                      <h3 className="font-bold text-lg text-slate-900">
                        {plane.callsign || 'Unknown'}
                      </h3>
                      <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        {plane.icao24.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Origin</span>
                        <span className="font-medium flex items-center gap-1">
                          <span title={plane.origin_country}>{getCountryFlag(plane.origin_country)}</span> {plane.origin_country}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Altitude</span>
                        <span className="font-medium font-mono">
                          {plane.baro_altitude ? Math.round(plane.baro_altitude * 3.28084).toLocaleString() + ' ft' : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Speed</span>
                        <span className="font-medium font-mono">
                          {plane.velocity ? Math.round(plane.velocity * 1.94384) + ' kts' : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Heading</span>
                        <span className="font-medium font-mono">
                          {plane.true_track ? Math.round(plane.true_track) + '°' : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ) : null
          ))}
        </MapContainer>
      </div>
      
      <div className={selectedPlane ? 'hidden' : 'flex flex-col h-full bg-white border-l border-slate-200 w-full md:w-[450px] lg:w-[600px] shrink-0 shadow-xl z-10'}>
        <FlightTable planes={planes} onPlaneClick={handlePlaneClick} />
      </div>
      {selectedPlane && (
        <FlightDetails plane={selectedPlane} onClose={() => setSelectedPlane(null)} />
      )}
    </div>
  );
}
