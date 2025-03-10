import { UserStats } from '../../lib/supabase';
import { BADGES, getUserTitle } from '../../lib/supabase';

interface ProfileStatsProps {
  stats: UserStats;
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Statistiche
        </label>
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Livello {stats?.level || 1}</span>
                <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                  {getUserTitle(stats?.level || 1)}
                </p>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">{stats?.xp || 0} XP</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${((stats?.xp || 0) % 100) / 100 * 100}%`
                }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stats?.reports_submitted || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Segnalazioni Inviate
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stats?.reports_verified || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Verifiche Effettuate
              </div>
            </div>
          </div>

          {stats?.badges && stats.badges.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Ultimi Badge Ottenuti</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {stats.badges.length} totali
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {stats.badges.slice(-5).reverse().map(badgeId => {
                  const badge = Object.values(BADGES).find(b => b.id === badgeId);
                  return badge && (
                    <div
                      key={badge.id}
                      className="flex items-center p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="text-3xl mr-3">{badge.icon}</span>
                      <div>
                        <div className="font-medium dark:text-white">{badge.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{badge.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}