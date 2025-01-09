import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Trash2, Sofa, AlertTriangle, Trash, Leaf, Package, Car, Truck, Building } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { WasteReport, User } from '../lib/supabase';
import { icon } from 'leaflet';

// Fix for default marker icon
const defaultIcon = icon({
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

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
    <Marker position={position} icon={defaultIcon}>
      <Popup>You are here</Popup>
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

export function Map() {
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedType, setSelectedType] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [notes, setNotes] = useState('');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadReports();
    getCurrentLocation();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
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
        .select('*');
      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
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
        center={[45.4642, 9.1900]} // Default to Milan
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <MapClickHandler onMapClick={() => setShowReportForm(false)} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker />
        {reports.map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={defaultIcon}
          >
            <Popup>
              <div>
                <h3 className="font-bold">{wasteTypes[report.waste_type]}</h3>
                <p>Size: {wasteSizes[report.size]}</p>
                <p>Status: {report.status}</p>
                {report.notes && <p>Notes: {report.notes}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <Link
        to="/profile"
        className="absolute top-4 left-4 bg-white text-green-600 px-4 py-2 rounded-lg shadow-lg z-[1000] hover:bg-gray-50"
      >
        {user ? 'Profilo' : 'Accedi'}
      </Link>

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