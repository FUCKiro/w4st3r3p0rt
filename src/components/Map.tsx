import { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle as LeafletCircle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { UserCircle2, PlusCircle, Crosshair } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { WasteReport } from '../lib/supabase';
import { XPPopup } from './XPPopup';
import { TipsCarousel } from './TipsCarousel';
import { divIcon, LocationEvent, LeafletEvent } from 'leaflet';
import { MapMarkers } from './map/MapMarkers';
import { AmaMarkers } from './map/AmaMarkers';
import { ReportForm } from './map/ReportForm';

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

const userLocationIcon = divIcon({
  className: 'custom-marker',
  html: `<div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background-color: #3B82F6; opacity: 0.2; animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
          <div style="background-color: #3B82F6; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-center; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); position: relative; z-index: 1;">
          <div style="background-color: #60A5FA; width: 12px; height: 12px; border-radius: 50%; animation: pulse 2s infinite;"></div>
          </div>
         </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

function LocationMarker() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMap();
  const [initialized, setInitialized] = useState(false);

  const zoomToShowRadius = () => {
    const radiusInMeters = 250;
    const metersPerPixel = radiusInMeters / (Math.min(map.getSize().x, map.getSize().y) / 2);
    const zoomLevel = Math.floor(Math.log2(40075016.686 * Math.abs(Math.cos(map.getCenter().lat * Math.PI/180)) / metersPerPixel / 256));
    return Math.min(zoomLevel, 18);
  };

  useEffect(() => {
    if (!initialized) {
      map.locate({
        setView: false,
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }).on("locationfound", (e: LocationEvent) => {
        setPosition([e.latlng.lat, e.latlng.lng]);
        map.setView(e.latlng, zoomToShowRadius());
        setInitialized(true);
      }).on("locationerror", (e: LeafletEvent) => {
        // Fallback silenzioso su Roma
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
    const radiusInMeters = 250;
    const metersPerPixel = radiusInMeters / (Math.min(map.getSize().x, map.getSize().y) / 2);
    const zoomLevel = Math.floor(Math.log2(40075016.686 * Math.abs(Math.cos(map.getCenter().lat * Math.PI/180)) / metersPerPixel / 256));
    return Math.min(zoomLevel, 18);
  };

  const handleRecenter = () => {
    map.locate({
      setView: true,
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    })
    .on("locationfound", (e: LocationEvent) => {
      const zoom = zoomToShowRadius();
      map.flyTo(e.latlng, zoom, {
        duration: 1
      });
    })
    .on("locationerror", () => {
      alert('Impossibile recuperare la posizione. Verifica che la geolocalizzazione sia attiva.');
    });
  };

  return (
    <button
      onClick={handleRecenter}
      className="absolute bottom-24 right-4 bg-white p-3 rounded-full shadow-lg z-[1000] hover:bg-gray-50 transition-colors mobile-button touch-manipulation"
      title="Centra sulla mia posizione"
    >
      <Crosshair className="w-5 h-5 text-gray-600" />
    </button>
  );
}

interface MapProps {
  onProfileClick: () => void;
  isProfileOpen?: boolean;
  session?: Session | null;
}

export function Map({ onProfileClick, isProfileOpen = false, session }: MapProps) {
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [nearbyReports, setNearbyReports] = useState<WasteReport[]>([]);
  const RADIUS = 250;
  const [mapInitialized, setMapInitialized] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(15);
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
          let errorMessage = 'Errore nel recupero della posizione';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permesso di geolocalizzazione negato. Attiva la geolocalizzazione per utilizzare tutte le funzionalità.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Posizione non disponibile. Verifica che il GPS sia attivo.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Timeout nel recupero della posizione. Riprova più tardi.';
              break;
          }
          alert(errorMessage);
          // Fallback su Roma come posizione di default
          setUserLocation([41.9028, 12.4964]);
        }
      );
    } else {
      alert('Il tuo browser non supporta la geolocalizzazione');
      setUserLocation([41.9028, 12.4964]);
    }
  };

  const loadReports = async () => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await supabase
        .from('waste_reports_with_users')
        .select('*')
        .neq('status', 'resolved');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

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
      console.error('Error loading reports:', error instanceof Error ? error.message : error);
      alert('Errore nel caricamento delle segnalazioni. Riprova più tardi.');
    }
  };

  useEffect(() => {
    if (userLocation) {
      loadReports();
    }
  }, [userLocation]);

  const verifyReport = async (reportId: string, isStillPresent: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get report details first
      const { data: report, error: reportError } = await supabase
        .from('waste_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (reportError) throw reportError;

      const { error } = await supabase
        .from('waste_reports')
        .update({
          status: isStillPresent ? 'verified' : 'resolved',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);
      
      if (error) throw error;

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

        // Prima verifica
        if (!newBadges.includes('first_verification')) {
          newBadges.push('first_verification');
        }

        // 5 verifiche
        if (stats.reports_verified + 1 >= 5 && !newBadges.includes('five_verifications')) {
          newBadges.push('five_verifications');
        }

        // Team player - verifica segnalazioni di altri
        if (report && report.user_id !== user.id && stats.reports_verified >= 4 && !newBadges.includes('team_player')) {
          newBadges.push('team_player');
        }

        // Rapid responder - verifica entro 30 minuti
        if (report) {
          const reportTime = new Date(report.created_at).getTime();
          const now = Date.now();
          const minutesDiff = (now - reportTime) / (1000 * 60);
          
          if (minutesDiff <= 30 && !newBadges.includes('rapid_responder') && report.status === 'new') {
            newBadges.push('rapid_responder');
          }
        }

        await supabase
          .from('user_stats')
          .update({
            xp: newXP,
            level: newLevel,
            reports_verified: stats.reports_verified + 1,
            badges: Array.from(new Set(newBadges))
          })
          .eq('user_id', user.id);

        setXpEarned({
          xp: 5,
          badges: newBadges.filter(badge => !stats.badges?.includes(badge))
        });
      }

      loadReports();
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Errore durante la verifica della segnalazione. Riprova più tardi.');
    }
  };

  const handleSubmitReport = async (type: number, size: number, notes: string) => {
    if (!userLocation) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('waste_reports').insert({
        user_id: user.id,
        latitude: userLocation[0],
        longitude: userLocation[1],
        waste_type: type,
        size: size,
        notes,
        status: 'new'
      });

      if (error) throw error;

      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      let newStats;
      if (!stats) {
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
        
        if (statsError) throw statsError;
        newStats = newUserStats;
      } else {
        const newXP = stats.xp + 10;
        const newLevel = Math.floor(newXP / 100) + 1;
        const newReportsSubmitted = stats.reports_submitted + 1;
        const newBadges = Array.from(new Set([...(stats.badges || [])]));

        // Prima segnalazione
        if (stats.reports_submitted === 0) {
          newBadges.push('first_report');
        }
        
        // 5 segnalazioni
        if (stats.reports_submitted + 1 >= 5 && !newBadges.includes('five_reports')) {
          newBadges.push('five_reports');
        }
        
        // 10 segnalazioni
        if (stats.reports_submitted + 1 >= 10 && !newBadges.includes('ten_reports')) {
          newBadges.push('ten_reports');
        }

        // Badge per tipo di rifiuto
        const typeCount = await supabase
          .from('waste_reports')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('waste_type', type);

        const count = typeCount.count || 0;
        if (count + 1 >= 5) {
          switch (type) {
            case 0: // Rifiuti Urbani
              if (!newBadges.includes('urban_guardian')) {
                newBadges.push('urban_guardian');
              }
              break;
            case 2: // Materiali Pericolosi
              if (!newBadges.includes('hazard_hunter')) {
                newBadges.push('hazard_hunter');
              }
              break;
            case 4: // Rifiuti Verdi
              if (!newBadges.includes('eco_warrior')) {
                newBadges.push('eco_warrior');
              }
              break;
          }
        }

        // Early Bird / Night Watch
        const hour = new Date().getHours();
        if (hour < 7 && !newBadges.includes('early_bird')) {
          newBadges.push('early_bird');
        } else if (hour >= 22 && !newBadges.includes('night_watch')) {
          newBadges.push('night_watch');
        }

        const { data: updatedStats, error: updateError } = await supabase
          .from('user_stats')
          .update({
            xp: newXP,
            level: newLevel,
            reports_submitted: newReportsSubmitted,
            badges: Array.from(new Set(newBadges))
          })
          .eq('user_id', user.id)
          .select()
          .single();

        if (updateError) throw updateError;
        newStats = updatedStats;
      }

      setXpEarned({
        xp: 10,
        badges: newStats.badges.filter((badge: string) => !stats?.badges?.includes(badge))
      });

      setShowReportForm(false);
      await loadReports();

      if (newStats) {
        window.dispatchEvent(new CustomEvent('update-profile-stats', { 
          detail: { stats: newStats }
        }));
      }
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  function MapEventHandler() {
    const map = useMapEvents({
      zoomend: () => {
        setCurrentZoom(map.getZoom());
      },
      click: () => {
        setShowReportForm(false);
      }
    });
    return null;
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[41.9028, 12.4964]}
        zoom={6}
        className="w-full h-full relative map-container"
        maxBounds={[[-90, -180], [90, 180]]}
        minZoom={3}
        zoomControl={false}
        attributionControl={false}
      >
        <MapEventHandler />
        <MapClickHandler onMapClick={() => setShowReportForm(false)} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
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

        <MapMarkers
          reports={nearbyReports}
          session={session}
          onVerifyReport={verifyReport}
          currentZoom={currentZoom}
        />

        <AmaMarkers />
      </MapContainer>
      
      {!isProfileOpen && (
        <button
          onClick={onProfileClick}
          className="absolute top-12 left-4 bg-white text-green-600 p-3 rounded-full shadow-lg z-[1000] hover:bg-gray-50 transition-colors"
          title={session?.user ? 'Profilo' : 'Accedi'}
        >
          <UserCircle2 className="w-5 h-5" />
        </button>
      )}

      {session?.user && (
        <button
          onClick={() => setShowReportForm(true)}
          className="absolute top-12 right-4 bg-green-600 text-white p-3 rounded-full shadow-lg z-[1000] hover:bg-green-700 transition-colors"
          title="Segnala Rifiuti"
        >
          <PlusCircle className="w-5 h-5" />
        </button>
      )}

      {showReportForm && (
        <ReportForm
          onSubmit={handleSubmitReport}
          onClose={() => setShowReportForm(false)}
          session={session}
        />
      )}
      
      {xpEarned && (
        <XPPopup
          xp={xpEarned.xp}
          badges={xpEarned.badges}
          onClose={() => setXpEarned(null)}
        />
      )}
    </div>
  );
}