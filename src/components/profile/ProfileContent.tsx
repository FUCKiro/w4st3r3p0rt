import React from 'react';
import { ProfileHeader } from './ProfileHeader';
import { ProfileStats } from './ProfileStats';
import { WeeklyActivity } from './WeeklyActivity';
import { WasteTypeChart } from './WasteTypeChart';
import { Achievements } from './Achievements';
import { ProfileActions } from './ProfileActions';

interface ProfileContentProps {
  profile: any;
  avatarSeed: string | null;
  onAvatarChange: () => void;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function ProfileContent({
  profile,
  avatarSeed,
  onAvatarChange,
  onLogout,
  isDark,
  onToggleTheme
}: ProfileContentProps) {
  return (
    <div className="px-6 pb-6 space-y-8">
      <ProfileHeader 
        profile={profile}
        avatarSeed={avatarSeed}
        onAvatarChange={onAvatarChange}
      />
      
      <ProfileStats stats={profile?.stats} />
      
      <WeeklyActivity reports={profile?.reports || []} />
      
      <WasteTypeChart reports={profile?.reports || []} />
      
      <Achievements badges={profile?.stats?.badges || []} />
      
      <ProfileActions 
        onLogout={onLogout}
        isDark={isDark}
        onToggleTheme={onToggleTheme}
      />
    </div>
  );
}