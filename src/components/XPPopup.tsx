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
    <div className="fixed bottom-32 right-4 z-[2001] animate-fade-in transform transition-all duration-300">
      <div className="bg-green-600 dark:bg-green-700 text-white rounded-full shadow-lg py-2 px-4 flex items-center space-x-2">
        <Trophy className="w-5 h-5 animate-bounce" />
        <span className="font-bold">+{xp} XP</span>
        {badges.length > 0 && (
          <div className="flex items-center space-x-2 border-l border-green-500 dark:border-green-600 ml-2 pl-2">
            <span className="text-sm">🏆</span>
            <span className="text-sm font-medium">{badges[0]}</span>
          </div>
        )}
      </div>
    </div>
  );
}