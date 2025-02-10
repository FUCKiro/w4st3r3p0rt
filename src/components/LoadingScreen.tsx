import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
}

export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [fillLevel, setFillLevel] = useState(0);
  const [stats, setStats] = useState({
    reports: 0,
    waste: 0,
    co2: 0
  });

  useEffect(() => {
    // Animazione di riempimento
    const fillInterval = setInterval(() => {
      setFillLevel((prev) => {
        if (prev >= 100) {
          clearInterval(fillInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
    
    // Timer fisso di 2.5 secondi
    const timer = setTimeout(() => {
      if (onLoadingComplete) {
        onLoadingComplete();
      }
    }, 2500);

    // Animazione delle statistiche
    const statsInterval = setInterval(() => {
      setStats(prev => ({
        reports: prev.reports + (Math.random() > 0.5 ? 1 : 0),
        waste: prev.waste + Math.floor(Math.random() * 10),
        co2: prev.co2 + Math.floor(Math.random() * 5)
      }));
    }, 100);

    return () => {
      clearInterval(fillInterval);
      clearInterval(statsInterval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-green-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-600 mb-2">Trash Hunter</h1>
        <p className="text-gray-600">Caricamento in corso...</p>
      </div>

      {/* Bidone animato */}
      <div className="relative w-32 h-40 mb-8">
        <div className="absolute inset-0 border-4 border-green-600 rounded-lg">
          <div 
            className="absolute bottom-0 left-0 right-0 bg-green-500 transition-all duration-300 rounded-b-md"
            style={{ 
              height: `${fillLevel}%`,
              opacity: 0.6
            }}
          />
          {/* Coperchio del bidone */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-36 h-3 bg-green-600 rounded" />
        </div>
      </div>

      {/* Statistiche animate */}
      <div className="grid grid-cols-3 gap-6 text-center max-w-md">
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-green-600">{stats.reports}</div>
          <div className="text-sm text-gray-600">Segnalazioni</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-green-600">{stats.waste} kg</div>
          <div className="text-sm text-gray-600">Rifiuti</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-green-600">{stats.co2} kg</div>
          <div className="text-sm text-gray-600">CO₂ Risparmiata</div>
        </div>
      </div>
    </div>
  );
}