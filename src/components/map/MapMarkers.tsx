import { Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import type { WasteReport } from '../../lib/supabase';
import { wasteTypes, wasteSizes } from '../../lib/constants';

interface MapMarkersProps {
  reports: WasteReport[];
  session: any;
  onVerifyReport: (reportId: string, isStillPresent: boolean) => void;
  currentZoom: number;
}

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
    html: `<div style="background-color: ${colors[type]}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-center; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);">
            <span style="font-size: 16px;">${icons[type]}</span>
           </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// Function to determine if a report should be visible at current zoom level
const isReportVisible = (report: WasteReport, currentZoom: number) => {
  if (currentZoom >= 15) return true;
  if (currentZoom >= 13) return report.size >= 1;
  if (currentZoom >= 11) return report.size >= 2;
  return report.size === 3;
};

export function MapMarkers({ reports, session, onVerifyReport, currentZoom }: MapMarkersProps) {
  return (
    <>
      {reports.filter(report => isReportVisible(report, currentZoom)).map((report) => (
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
                      onClick={() => onVerifyReport(report.id, true)}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                    >
                      {report.status === 'new' ? 'Conferma Presenza' : 'Ancora Presente'}
                    </button>
                    <button
                      onClick={() => onVerifyReport(report.id, false)}
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
    </>
  );
}