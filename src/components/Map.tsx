import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Trash2, Sofa, AlertTriangle, Trash, Leaf, Package, Car, Truck, Building } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { WasteReport } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { icon, divIcon, latLng } from 'leaflet';

const RADIUS_METERS = 400;

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

  useEffect(() => {
    map.locate().on("locationfound", (e) => {
      setPosition([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, 13);
    });
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
          filterNearbyReports(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const filterNearbyReports = (lat: number, lng: number) => {
    if (!reports.length) return;
    
    const userPos = latLng(lat, lng);
    const nearby = reports.filter(report => {
      const reportPos = latLng(report.latitude, report.longitude);
      const distance = userPos.distanceTo(reportPos);
      return distance <= RADIUS_METERS;
    });
    
    setNearbyReports(nearby);
  };

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('waste_reports')
        .select('*');
      if (error) throw error;
      setReports(data || []);
      if (userLocation) {
        filterNearbyReports(userLocation[0], userLocation[1]);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const verifyReport = async (reportId: string, isStillPresent: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('waste_reports')
        .update({
          status: isStillPresent ? 'verified' : 'resolved',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;
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

      setShowReportForm(false);
      setNotes('');
      loadReports();
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  return (
    <div className="h-screen relative">
      <MapContainer
        center={[41.9028, 12.4964]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <MapClickHandler onMapClick={() => setShowReportForm(false)} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker />
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
          className="absolute top-4 left-4 bg-white text-green-600 px-4 py-2 rounded-lg shadow-lg z-[1000] hover:bg-gray-50 transition-colors"
        >
          {user ? 'Profilo' : 'Accedi'}
        </button>
      )}

      {user && (
        <button
          onClick={() => setShowReportForm(true)}
          className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-[1000]"
        >
          Segnala Rifiuti
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