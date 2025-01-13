import { useEffect } from 'react';
import { Trophy } from 'lucide-react';

interface XPPopupProps {
  xp: number;
  badges?: string[];
  onClose: () => void;
}

export function XPPopup({ xp, badges = [], onClose }: XPPopupProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-[2001] animate-fade-in">
      <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Trophy className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-medium text-green-800 dark:text-green-200">
              +{xp} XP Guadagnati!
            </p>
            {badges.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-green-600 dark:text-green-300">
                  Nuovo badge sbloccato:
                </p>
                <div className="flex space-x-2 mt-1">
                  {badges.map((badge, index) => (
                    <div 
                      key={index}
                      className="bg-white dark:bg-green-800 rounded-full px-2 py-1 text-sm text-green-700 dark:text-green-200 border border-green-200 dark:border-green-600"
                    >
                      {badge}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}