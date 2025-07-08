import React from 'react';
import { getUserTitle } from '../../lib/supabase';

interface ProfileHeaderProps {
  profile: any;
  avatarSeed: string | null;
  onAvatarChange: () => void;
}

export function ProfileHeader({ profile, avatarSeed, onAvatarChange }: ProfileHeaderProps) {
  return (
    <div className="text-center space-y-4">
      {/* Avatar */}
      <div className="relative inline-block">
        <div className="w-24 h-24 rounded-full bg-teal-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-white dark:ring-gray-800">
          {avatarSeed ? (
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=14b8a6`}
              alt="Avatar"
              className="w-full h-full rounded-full"
            />
          ) : (
            profile?.username ? profile.username.charAt(0).toUpperCase() : '👤'
          )}
        </div>
        <button
          onClick={onAvatarChange}
          className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-teal-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Username */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-wide">
          {profile?.username || 'UTENTE'}
        </h1>
        {profile?.stats?.level && (
          <p className="text-sm text-teal-600 dark:text-teal-400 font-medium">
            {getUserTitle(profile.stats.level)}
          </p>
        )}
      </div>
    </div>
  );
}