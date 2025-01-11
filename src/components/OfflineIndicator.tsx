import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [hasOfflineData, setHasOfflineData] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg shadow-lg z-[1001] p-4 flex items-center space-x-3">
      <WifiOff className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
      <div>
        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
          Modalità Offline
        </p>
        <p className="text-xs text-yellow-600 dark:text-yellow-300">
          {hasOfflineData 
            ? 'Stai visualizzando i dati salvati localmente'
            : 'Alcune funzionalità potrebbero non essere disponibili'}
        </p>
      </div>
    </div>
  );
}