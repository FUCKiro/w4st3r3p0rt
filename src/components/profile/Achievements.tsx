import React from 'react';
import { BADGES } from '../../lib/supabase';

interface AchievementsProps {
  badges: string[];
}

export function Achievements({ badges }: AchievementsProps) {
  const achievementIcons = ['🗑️', '🏆', '🌱', '🌍'];
  const achievementColors = ['bg-cyan-100', 'bg-orange-100', 'bg-green-100', 'bg-teal-100'];
  const lockedColor = 'bg-gray-200 dark:bg-gray-700';

  const achievements = [
    { id: 'first_report', name: 'Cacciatore di Plastica', unlocked: badges.includes('first_report') },
    { id: 'five_reports', name: 'Campione della Pulizia', unlocked: badges.includes('five_reports') },
    { id: 'eco_warrior', name: 'Guerriero Verde', unlocked: badges.includes('eco_warrior') },
    { id: 'team_player', name: 'Impatto Globale', unlocked: badges.includes('team_player') }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Obiettivi
      </h3>
      
      <div className="grid grid-cols-4 gap-4">
        {achievements.map((achievement, index) => (
          <div key={achievement.id} className="text-center">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-2 mx-auto ${
                achievement.unlocked ? achievementColors[index] : lockedColor
              } ${achievement.unlocked ? '' : 'opacity-40'}`}
            >
              {achievement.unlocked ? achievementIcons[index] : '🔒'}
            </div>
            <div className={`text-xs font-medium ${
              achievement.unlocked 
                ? 'text-gray-900 dark:text-white' 
                : 'text-gray-400 dark:text-gray-600'
            }`}>
              {achievement.name}
            </div>
          </div>
        ))}
      </div>

      {/* Level Progress */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            LIVELLO {Math.floor((badges.length * 20) / 100) + 1}
          </span>
          <div className="flex space-x-1">
            {[1, 2, 3].map((level) => (
              <div
                key={level}
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  level <= Math.floor((badges.length * 20) / 100) + 1
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            ))}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-teal-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(badges.length * 20) % 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}