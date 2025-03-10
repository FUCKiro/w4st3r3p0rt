import { Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { amaPoints } from '../../lib/ama-points';

// Icona personalizzata per i centri di raccolta AMA
const amaIcon = divIcon({
  className: 'custom-marker',
  html: `<div style="background-color: #16a34a; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-center; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
          <span style="font-size: 18px;">♻️</span>
         </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export function AmaMarkers() {
  return (
    <>
      {amaPoints.map((point) => (
        <Marker
          key={point.name}
          position={[point.latitude, point.longitude]}
          icon={amaIcon}
        >
          <Popup>
            <div className="p-3">
              <h3 className="font-bold text-lg text-green-600 mb-2">{point.name}</h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-500 font-medium">
                  Municipio {point.municipio}
                </p>
                <p className="flex items-start">
                  <span className="font-medium mr-1">Indirizzo:</span>
                  <span className="text-gray-600">{point.address}</span>
                </p>
                {point.metro && (
                  <p className="text-sm text-blue-600">
                    <span className="mr-1">🚇</span>
                    {point.metro}
                  </p>
                )}
                <p className="flex items-start">
                  <span className="font-medium mr-1">Orari:</span>
                  <span className="text-gray-600 whitespace-pre-line">{point.hours}</span>
                </p>
                {point.notes && (
                  <p className="text-sm text-red-600 mt-2 font-medium">
                    {point.notes}
                  </p>
                )}
                <div className="mt-4 pt-2 border-t border-gray-200">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}&travelmode=driving`;
                        window.open(mapsUrl, '_blank');
                      }
                    }}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Indicazioni Stradali</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                </div>
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
    </>
  );
}