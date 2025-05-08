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
    <div className="fixed top-28 right-4 z-[2001] animate-fade-in transform transition-all duration-300 pointer-events-none">
      <div className="bg-green-600 dark:bg-green-700 text-white rounded-full shadow-xl py-3 px-6 flex items-center space-x-3 border border-white/20">
        <Trophy className="w-5 h-5 animate-bounce" />
        <span className="font-bold text-xl tracking-wide">+{xp} XP</span>
        {badges.length > 0 && (
          <div className="flex items-center space-x-3 border-l border-white/20 ml-3 pl-3">
            <span className="text-lg">🏆</span>
            <span className="text-base font-medium tracking-wide">{badges[0]}</span>
          </div>
        )}
      </div>
    </div>
  );
}