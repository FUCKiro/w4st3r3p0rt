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
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-[2001] animate-fade-in transform transition-all duration-500">
      <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg shadow-xl p-4 max-w-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-green-400 dark:bg-green-600 opacity-10 animate-pulse"></div>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Trophy className="w-8 h-8 text-green-600 dark:text-green-400 animate-bounce" />
          </div>
          <div>
            <p className="font-bold text-xl text-green-800 dark:text-green-200 animate-pulse">
              +{xp} XP!
            </p>
            {badges.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-green-600 dark:text-green-300">
                  Nuovo badge sbloccato:
                </p>
                <div className="flex space-x-2 mt-1">
                  {badges.map((badge, index) => (
                    <div 
                      key={index}
                      className="bg-white dark:bg-green-800 rounded-full px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-200 border-2 border-green-200 dark:border-green-600 shadow-sm animate-bounce"
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