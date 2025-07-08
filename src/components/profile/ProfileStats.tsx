import { UserStats } from '../../lib/supabase';
import { BADGES, getUserTitle } from '../../lib/supabase';

interface ProfileStatsProps {
  stats: UserStats | null;
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  if (!stats) return null;
  
  const totalReports = (stats.reports_submitted || 0) + (stats.reports_verified || 0);
  
  return (
    <div className="text-center">
      {/* Circular Progress */}
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${(totalReports / 150) * 251.2} 251.2`}
            strokeLinecap="round"
            className="text-teal-500 transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {totalReports}
          </div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Totale<br />Segnalazioni
          </div>
        </div>
      </div>
    </div>
  );
}