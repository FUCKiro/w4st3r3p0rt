import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle as LeafletCircle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Trash2, Sofa, AlertTriangle, Trash, Leaf, Package, Car, Truck, Building, Crosshair, UserCircle2, PlusCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { amaPoints } from '../lib/ama-points';
import type { WasteReport } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { XPPopup } from './XPPopup';
import { TipsCarousel } from './TipsCarousel';
import { icon, divIcon, LeafletEvent, LeafletMouseEvent, LocationEvent } from 'leaflet';

// Function to calculate distance between two points in meters
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

// Custom marker for user location
const userLocationIcon = divIcon({
  className: 'custom-marker',
  html: `<div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background-color: #3B82F6; opacity: 0.2; animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
          <div style="background-color: #3B82F6; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); position: relative; z-index: 1;">
          <div style="background-color: #60A5FA; width: 12px; height: 12px; border-radius: 50%; animation: pulse 2s infinite;"></div>
          </div>
         </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Fix for default marker icon
const defaultIcon = icon({
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Custom marker icons for each waste type
const getWasteIcon = (type: number) => {
  const colors = [
    '#4B5563', // Urban Waste - Gray
    '#8B5CF6', // Bulky Items - Purple
    '#EF4444', // Hazardous - Red
    '#F59E0B', // Illegal Dumping - Orange
    '#10B981', // Green Waste - Green
  ];

  const icons = [
    '🗑️', // Urban Waste
    '🛋️', // Bulky Items
    '⚠️', // Hazardous
    '❌', // Illegal Dumping
    '🌿', // Green Waste
  ];

  return divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${colors[type]}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
            <span style="font-size: 16px;">${icons[type]}</span>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};
// Icona personalizzata per i centri di raccolta AMA
const amaIcon = divIcon({
  className: 'custom-marker',
  html: `<div style="background-color: #16a34a; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
          <span style="font-size: 18px;">♻️</span>
         </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function LocationMarker() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMap();
  const [initialized, setInitialized] = useState(false);

  const zoomToShowRadius = () => {
    // Calculate zoom level to show 250m radius
    const radiusInMeters = 250;
    const metersPerPixel = radiusInMeters / (Math.min(map.getSize().x, map.getSize().y) / 2);
    const zoomLevel = Math.floor(Math.log2(40075016.686 * Math.abs(Math.cos(map.getCenter().lat * Math.PI/180)) / metersPerPixel / 256));
    return Math.min(zoomLevel, 18); // Cap at zoom level 18
  };

  useEffect(() => {
    if (!initialized) {
      map.locate({
        setView: false,
        enableHighAccuracy: true
      }).on("locationfound", (e: LocationEvent) => {
        setPosition([e.latlng.lat, e.latlng.lng]);
        map.setView(e.latlng, zoomToShowRadius());
        setInitialized(true);
      }).on("locationerror", (e: LeafletEvent) => {
        console.error("Error getting location:", e);
        // Fallback to default location (Italy)
        map.flyTo([41.9028, 12.4964], zoomToShowRadius());
        setInitialized(true);
      });
    }
  }, [map, initialized]);

  return position === null ? null : (
    <Marker position={position} icon={userLocationIcon}>
      <Popup>
        <div className="text-center">
          <span className="font-medium">La tua posizione</span>
        </div>
      </Popup>
    </Marker>
  );
}

function MapClickHandler({ onMapClick }: { onMapClick: () => void }) {
  useMapEvents({
    click: () => {
      onMapClick();
    },
  });
  return null;
}

function RecenterButton() {
  const map = useMap();

  const zoomToShowRadius = () => {
    // Calculate zoom level to show 250m radius
    const radiusInMeters = 250;
    const metersPerPixel = radiusInMeters / (Math.min(map.getSize().x, map.getSize().y) / 2);
    const zoomLevel = Math.floor(Math.log2(40075016.686 * Math.abs(Math.cos(map.getCenter().lat * Math.PI/180)) / metersPerPixel / 256));
    return Math.min(zoomLevel, 18); // Cap at zoom level 18
  };

  const handleRecenter = () => {
    map.locate().on("locationfound", (e: LocationEvent) => {
      map.flyTo(e.latlng, zoomToShowRadius());
    });
  };

  return (
    <button
      onClick={handleRecenter}
      className="absolute bottom-24 right-4 bg-white p-3 rounded-full shadow-lg z-[1000] hover:bg-gray-50 transition-colors mobile-button"
      title="Centra sulla mia posizione"
    >
      <Crosshair className="w-5 h-5 text-gray-600" />
    </button>
  );
}

const wasteTypes = [
  'Rifiuti Urbani',
  'Rifiuti Ingombranti',
  'Materiali Pericolosi',
  'Discarica Abusiva',
  'Rifiuti Verdi'
];

const wasteIcons = [
  Trash2,
  Sofa,
  AlertTriangle,
  Trash,
  Leaf
];

const wasteSizes = [
  'Piccolo (entra in un sacchetto)',
  'Medio (entra in un\'auto)',
  'Grande (necessita di un camion)',
  'Molto Grande (discarica illegale)'
];

const sizeIcons = [
  Package,
  Car,
  Truck,
  Building
];

interface MapProps {
  onProfileClick: () => void;
  isProfileOpen?: boolean;
  session?: Session | null;
}

export function Map({ onProfileClick, isProfileOpen = false, session }: MapProps) {
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedType, setSelectedType] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [notes, setNotes] = useState('');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [nearbyReports, setNearbyReports] = useState<WasteReport[]>([]);
  const RADIUS = 250; // 250 meters radius
  const [mapInitialized, setMapInitialized] = useState(false);
  const [xpEarned, setXpEarned] = useState<{ xp: number; badges: string[] } | null>(null);

  useEffect(() => {
    loadReports();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const loadReports = async () => {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        return;
      }

      const { data, error } = await supabase
        .from('waste_reports_with_users')
        .select('*')
        .neq('status', 'resolved');

      if (error) {
        console.error('Error fetching reports:', error);
        return;
      }

      // Filter reports within radius if user location is available
      if (userLocation) {
        const filtered = (data || []).filter((report: WasteReport) => {
          const distance = calculateDistance(
            userLocation[0],
            userLocation[1],
            report.latitude,
            report.longitude
          );
          return distance <= RADIUS;
        });
        setNearbyReports(filtered);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      // Handle specific error types if needed
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          console.error('Network error - check your connection');
        }
      }
    }
  };

  // Update nearby reports when user location changes
  useEffect(() => {
    if (userLocation) {
      loadReports();
    }
  }, [userLocation]);

  const verifyReport = async (reportId: string, isStillPresent: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Aggiorna lo stato del report
      const { error } = await supabase
        .from('waste_reports')
        .update({
          status: isStillPresent ? 'verified' : 'resolved',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);
      
      if (error) throw error;

      // Aggiorna le statistiche dell'utente
      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!stats) {
        await supabase.from('user_stats').insert({
          user_id: user.id,
          xp: 5,
          level: 1,
          reports_submitted: 0,
          reports_verified: 1,
          badges: ['first_verification']
        });
      } else {
        const newXP = stats.xp + 5;
        const newLevel = Math.floor(newXP / 100) + 1;
        const newBadges = stats.badges ? [...stats.badges] : [];

        // Aggiungi il badge first_verification se è la prima verifica
        if (stats.reports_verified === 0 && !newBadges.includes('first_verification')) {
          newBadges.push('first_verification');
        }

        // Aggiungi il badge five_verifications se raggiungiamo 5 verifiche
        if (stats.reports_verified + 1 === 5) {
          newBadges.push('five_verifications');
        }

        await supabase
          .from('user_stats')
          .update({
            xp: newXP,
            level: newLevel,
            reports_verified: stats.reports_verified + 1,
            badges: Array.from(new Set(newBadges)) // Rimuove eventuali duplicati
          })
          .eq('user_id', user.id);

        // Mostra il popup XP
        setXpEarned({
          xp: 5,
          badges: newBadges.filter(badge => !stats.badges?.includes(badge))
        });
      }

      loadReports();
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  const submitReport = async () => {
    if (!userLocation) return;

    let newStats;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Submit the report
      const { error } = await supabase.from('waste_reports').insert({
        user_id: user.id,
        latitude: userLocation[0],
        longitude: userLocation[1],
        waste_type: selectedType,
        size: selectedSize,
        notes,
        status: 'new'
      });

      if (error) throw error;

      // Update user stats
      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!stats) {
        // Create new stats for first-time user
        const initialBadges = ['first_report'];
        const { data: newUserStats, error: statsError } = await supabase
          .from('user_stats')
          .insert({
          user_id: user.id,
          xp: 10,
          level: 1,
          reports_submitted: 1,
          reports_verified: 0,
          badges: initialBadges
        })
        .select()
        .single();
        
        if (statsError) {
          console.error('Error creating user stats:', statsError);
          throw statsError;
        }
        
        newStats = newUserStats;
      } else {
        const newXP = stats.xp + 10;
        const newLevel = Math.floor(newXP / 100) + 1;
        const newReportsSubmitted = stats.reports_submitted + 1;
        const newBadges = [...(stats.badges || [])];

        // Check for new badges
        if (!newBadges.includes('first_report')) {
          newBadges.push('first_report');
        }
        if (newReportsSubmitted === 5 && !newBadges.includes('five_reports')) {
          newBadges.push('five_reports');
        }
        if (newReportsSubmitted === 10 && !newBadges.includes('ten_reports')) {
          newBadges.push('ten_reports');
        }

        const { data: updatedStats, error: updateError } = await supabase
          .from('user_stats')
          .update({
            xp: newXP,
            level: newLevel,
            reports_submitted: newReportsSubmitted,
            badges: newBadges
          })
          .eq('user_id', user.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating user stats:', updateError);
          throw updateError;
        }
        
        newStats = updatedStats;
      }
      
      // Mostra il popup XP
      setXpEarned({
        xp: 10,
        badges: newStats.badges.filter((badge: string) => !stats?.badges?.includes(badge))
      });

      setShowReportForm(false);
      setNotes('');
      await loadReports();
      
      // Aggiorna le statistiche nel profilo
      if (newStats) {
        window.dispatchEvent(new CustomEvent('update-profile-stats', { 
          detail: { stats: newStats }
        }));
      }
      
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[41.9028, 12.4964]} // Default center on Italy
        zoom={6}
        className="w-full h-full relative map-container"
        maxBounds={[[-90, -180], [90, 180]]}
        minZoom={3}
        zoomControl={false}
        attributionControl={false}
      >
        <MapClickHandler onMapClick={() => setShowReportForm(false)} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Attribution con stile personalizzato */}
        <div className="absolute bottom-4 right-4 z-[1000] bg-white bg-opacity-75 px-2 py-1 rounded text-xs text-gray-600">
          © OpenStreetMap contributors
        </div>
        <LocationMarker />
        <RecenterButton />
        {mapInitialized && userLocation && (
          <LeafletCircle
            center={userLocation}
            radius={RADIUS}
            pathOptions={{
              color: '#059669',
              fillColor: '#059669',
              fillOpacity: 0.05,
              weight: 2,
              dashArray: '6, 8',
              className: 'pulse-border'
            }}
          />
        )}
        {nearbyReports.map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={getWasteIcon(Number(report.waste_type))}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg mb-2">{wasteTypes[report.waste_type]}</h3>
                <div className="space-y-2">
                  <p className="flex items-center">
                    <span className="font-medium mr-1">Dimensione:</span>
                    {wasteSizes[report.size]}
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium mr-1">Stato:</span>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      report.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      report.status === 'verified' ? 'bg-yellow-100 text-yellow-800' :
                      report.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                      report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {report.status === 'new' ? 'Nuovo' :
                       report.status === 'verified' ? 'Verificato' :
                       report.status === 'in_progress' ? 'In Corso' :
                       report.status === 'resolved' ? 'Risolto' :
                       'Archiviato'}
                    </span>
                  </p>
                  {report.notes && (
                    <p className="flex items-start">
                      <span className="font-medium mr-1">Note:</span>
                      <span className="text-gray-600">{report.notes}</span>
                    </p>
                  )}
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-sm text-gray-500 flex items-center">
                      <span className="font-medium mr-1">Segnalato da:</span>
                      <span className="bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded-full">
                        {report.username || 'Utente Anonimo'}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(report.created_at).toLocaleDateString('it-IT', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {session?.user && (report.status === 'new' || report.status === 'verified') && (
                    <div className="mt-4 space-x-2">
                      <button
                        onClick={() => verifyReport(report.id, true)}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                      >
                        {report.status === 'new' ? 'Conferma Presenza' : 'Ancora Presente'}
                      </button>
                      <button
                        onClick={() => verifyReport(report.id, false)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                      >
                        {report.status === 'new' ? 'Non Presente' : 'Risolto'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Centri di raccolta AMA */}
        {amaPoints.map((point) => (
          <Marker
            key={point.name}
            position={[point.latitude, point.longitude]}
            icon={amaIcon}
          >
            <Popup>
              <div className="p-3">
                <h3 className="font-bold text-lg text-green-600 mb-2">{point.name}</h3>
                <div className="space-y-2">
                  <p className="flex items-start">
                    <span className="font-medium mr-1">Indirizzo:</span>
                    <span className="text-gray-600">{point.address}</span>
                  </p>
                  <p className="flex items-start">
                    <span className="font-medium mr-1">Orari:</span>
                    <span className="text-gray-600">{point.hours}</span>
                  </p>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      Centro di Raccolta AMA Roma
                    </p>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {!isProfileOpen && (
        <button
          onClick={onProfileClick}
          className="absolute top-4 left-4 bg-white text-green-600 p-3 rounded-full shadow-lg z-[1000] hover:bg-gray-50 transition-colors"
          title={session?.user ? 'Profilo' : 'Accedi'}
        >
          <UserCircle2 className="w-5 h-5" />
        </button>
      )}

      {session?.user && (
        <button
          onClick={() => setShowReportForm(true)}
          className="absolute top-4 right-4 bg-green-600 text-white p-3 rounded-full shadow-lg z-[1000] hover:bg-green-700 transition-colors"
          title="Segnala Rifiuti"
        >
          <PlusCircle className="w-5 h-5" />
        </button>
      )}

      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-[1000]" onClick={() => setShowReportForm(false)}>
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-xl shadow-lg z-[1000] report-form-panel transform transition-transform duration-300 ease-out"
            onClick={e => e.stopPropagation()}
          >
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Segnala Rifiuti</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo di Rifiuto
              </label>
              <div className="grid grid-cols-5 gap-2 waste-type-grid">
                {wasteTypes.map((type, index) => {
                  const IconComponent = wasteIcons[index];
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedType(index)}
                      className={`flex flex-col items-center p-2 rounded-lg border mobile-button ${
                        selectedType === index
                          ? 'border-green-500 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-green-200 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <IconComponent className="w-6 h-6 mb-1 text-current" />
                      <span className="text-xs text-center">{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dimensione
              </label>
              <div className="grid grid-cols-4 gap-2 waste-size-grid">
                {wasteSizes.map((size, index) => {
                  const IconComponent = sizeIcons[index];
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(index)}
                      className={`flex flex-col items-center p-2 rounded-lg border mobile-button ${
                        selectedSize === index
                          ? 'border-green-500 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-green-200 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <IconComponent className="w-6 h-6 mb-1 text-current" />
                      <span className="text-xs text-center">{size}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {(selectedType !== null && selectedSize !== null) && (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Note aggiuntive..."
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                rows={3}
              />
            )}

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setShowReportForm(false)}
                className="flex-1 bg-gray-500 dark:bg-gray-600 text-white px-4 py-2 rounded mobile-button hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={submitReport}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded mobile-button hover:bg-green-700 dark:hover:bg-green-800 transition-colors"
                disabled={!session?.user}
              >
                Invia
              </button>
            </div>
          </div>
          </div>
        </div>
      )}
      
      {xpEarned && (
        <XPPopup
          xp={xpEarned.xp}
          badges={xpEarned.badges}
          onClose={() => setXpEarned(null)}
        />
      )}
      <TipsCarousel />
    </div>
  );
}