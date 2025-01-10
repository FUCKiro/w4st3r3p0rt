import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Trash2, Sofa, AlertTriangle, Trash, Leaf, Package, Car, Truck, Building, Crosshair, UserCircle2, PlusCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { WasteReport } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { icon, divIcon, latLng, LatLng } from 'leaflet';

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
  html: `<div style="background-color: #3B82F6; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
          <div style="background-color: #60A5FA; width: 12px; height: 12px; border-radius: 50%; animation: pulse 2s infinite;"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
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
function LocationMarker() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMap();
  const [hasInitialLocation, setHasInitialLocation] = useState(false);

  useEffect(() => {
    if (!hasInitialLocation) {
      map.locate({
        setView: true,
        maxZoom: 16,
        enableHighAccuracy: true
      }).on("locationfound", (e) => {
        setPosition([e.latlng.lat, e.latlng.lng]);
        setHasInitialLocation(true);
      }).on("locationerror", (e) => {
        console.error("Error getting location:", e);
        // Fallback to default location (Italy)
        map.setView([41.9028, 12.4964], 6);
      });
    }
  }, [map]);

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

  const handleRecenter = () => {
    map.locate().on("locationfound", (e) => {
      map.flyTo(e.latlng, 15);
    });
  };

  return (
    <button
      onClick={handleRecenter}
      className="absolute bottom-20 right-4 bg-white p-3 rounded-full shadow-lg z-[1000] hover:bg-gray-50 transition-colors"
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
}

export function Map({ onProfileClick, isProfileOpen = false }: MapProps) {
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedType, setSelectedType] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [notes, setNotes] = useState('');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [nearbyReports, setNearbyReports] = useState<WasteReport[]>([]);
  const RADIUS = 250; // 250 meters radius

  useEffect(() => {
    loadReports();
    getCurrentLocation();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user as User | null);
  };

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
      const { data, error } = await supabase
        .from('waste_reports') 
        .select('*')
        .neq('status', 'resolved');  // Esclude i report risolti
        
      if (error) throw error;
      
      // Filter reports within radius if user location is available
      if (userLocation) {
        const filtered = (data || []).filter(report => {
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
          xp: 2,
          level: 1,
          reports_submitted: 0,
          reports_verified: 1,
          badges: ['first_verification']
        });
      } else {
        const newXP = stats.xp + 2;
        const newLevel = Math.floor(newXP / 100) + 1;
        const newBadges = [...stats.badges];

        if (stats.reports_verified + 1 === 5) {
          newBadges.push('five_verifications');
        }

        await supabase
          .from('user_stats')
          .update({
            xp: newXP,
            level: newLevel,
            reports_verified: stats.reports_verified + 1,
            badges: newBadges
          })
          .eq('user_id', user.id);
      }

      loadReports();
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  const submitReport = async () => {
    if (!userLocation) return;

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
        await supabase.from('user_stats').insert({
          user_id: user.id,
          xp: 10,
          level: 1,
          reports_submitted: 1,
          reports_verified: 0,
          badges: initialBadges
        });
      } else {
        const newXP = stats.xp + 10;
        const newLevel = Math.floor(newXP / 100) + 1;
        const newReportsSubmitted = stats.reports_submitted + 1;
        const newBadges = Array.isArray(stats.badges) ? [...stats.badges] : [];

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

        const { error: updateError } = await supabase
          .from('user_stats')
          .update({
            xp: newXP,
            level: newLevel,
            reports_submitted: newReportsSubmitted,
            badges: newBadges
          })
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error updating user stats:', updateError);
          throw updateError;
        }
      }

      setShowReportForm(false);
      setNotes('');
      await loadReports();
      // Ricarica il profilo per aggiornare le statistiche visualizzate
      window.dispatchEvent(new Event('reload-profile'));
      
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  return (
    <div className="h-screen relative">
      <MapContainer
        center={[0, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
      >
        <MapClickHandler onMapClick={() => setShowReportForm(false)} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker />
        <RecenterButton />
        {nearbyReports.map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={getWasteIcon(report.waste_type)}
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
                  {user && report.status === 'new' && (
                    <div className="mt-4 space-x-2">
                      <button
                        onClick={() => verifyReport(report.id, true)}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                      >
                        Conferma Presenza
                      </button>
                      <button
                        onClick={() => verifyReport(report.id, false)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                      >
                        Non Presente
                      </button>
                    </div>
                  )}
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
          title={user ? 'Profilo' : 'Accedi'}
        >
          <UserCircle2 className="w-5 h-5" />
        </button>
      )}

      {user && (
        <button
          onClick={() => setShowReportForm(true)}
          className="absolute top-4 right-4 bg-green-600 text-white p-3 rounded-full shadow-lg z-[1000] hover:bg-green-700 transition-colors"
          title="Segnala Rifiuti"
        >
          <PlusCircle className="w-5 h-5" />
        </button>
      )}

      {showReportForm && (
        <div className="absolute bottom-0 left-0 right-0 bg-white p-4 shadow-lg z-[1000]">
          <h3 className="text-lg font-bold mb-4">Segnala Rifiuti</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo di Rifiuto
              </label>
              <div className="grid grid-cols-5 gap-2">
                {wasteTypes.map((type, index) => {
                  const IconComponent = wasteIcons[index];
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedType(index)}
                      className={`flex flex-col items-center p-3 rounded-lg border ${
                        selectedType === index
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-green-200 hover:bg-green-50'
                      }`}
                    >
                      <IconComponent className="w-6 h-6 mb-1" />
                      <span className="text-xs text-center">{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensione
              </label>
              <div className="grid grid-cols-4 gap-2">
                {wasteSizes.map((size, index) => {
                  const IconComponent = sizeIcons[index];
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(index)}
                      className={`flex flex-col items-center p-3 rounded-lg border ${
                        selectedSize === index
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-green-200 hover:bg-green-50'
                      }`}
                    >
                      <IconComponent className="w-6 h-6 mb-1" />
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
                className="w-full p-2 border rounded"
                rows={3}
              />
            )}

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setShowReportForm(false)}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded"
              >
                Annulla
              </button>
              <button
                onClick={submitReport}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded"
              >
                Invia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}