import { BADGES } from '../../lib/supabase';

interface ProfileAchievementsProps {
  badges: string[];
}

export function ProfileAchievements({ badges = [] }: ProfileAchievementsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Obiettivi
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {badges.length} di {Object.keys(BADGES).length} sbloccati
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {Object.values(BADGES).map((badge) => (
          <div
            key={badge.id}
            className={`p-3 rounded-lg border transition-all ${
              badges.includes(badge.id)
                ? 'bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800'
                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-75'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm">
                <span className="text-xl">{badge.icon || '🏆'}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {badge.name}
                  </h4>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                  {badge.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}