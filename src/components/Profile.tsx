import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AuthForm } from './AuthForm';
import { X, Moon, Sun, BarChart2, ScrollText, Leaf, Info, Trophy } from 'lucide-react';
import { InfoDialog } from './InfoDialog';
import { ProfileStats } from './profile/ProfileStats';
import { ProfileReports } from './profile/ProfileReports';
import { ProfileImpact } from './profile/ProfileImpact';
import { ProfileAchievements } from './profile/ProfileAchievements';
import { ProfileContent } from './profile/ProfileContent';
import { getUserTitle } from '../lib/supabase';

interface ProfileProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
  stats?: any;
}

export function Profile({ isOpen, onClose, session, stats }: ProfileProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState<string | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(savedTheme === 'dark' || (!savedTheme && prefersDark));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    if (session) {
      loadProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (stats && profile) {
      setProfile({
        ...profile,
        stats
      });
    }
  }, [stats]);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data: metadata } = await supabase.auth.getUser();
      const username = metadata.user?.user_metadata?.username || '';

      const { data: avatarData } = await supabase
        .from('user_stats')
        .select('avatar_seed')
        .eq('user_id', user.id)
        .single();

      if (avatarData?.avatar_seed) {
        setAvatarSeed(avatarData.avatar_seed);
      }

      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: reports } = await supabase
        .from('waste_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!stats) {
        const { data: newStats, error: createError } = await supabase
          .from('user_stats')
          .insert({
            user_id: user.id,
            xp: 0,
            level: 1,
            reports_submitted: 0,
            reports_verified: 0,
            badges: []
          })
          .select()
          .single();

        if (createError) throw createError;

        setProfile({
          username,
          email: user.email!,
          stats: newStats,
          reports: reports || []
        });
      } else {
        setProfile({
          username,
          email: user.email!,
          stats,
          reports: reports || []
        });
      }

      setError(null);
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Errore nel caricamento del profilo. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setProfile(null);
      onClose();
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Errore durante la disconnessione. Riprova più tardi.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Caricamento...</div>
      </div>
    );
  }

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-[1999]"
          onClick={onClose}
        />
      )}
      <div 
        className={`fixed inset-y-0 left-0 w-full sm:w-96 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out z-[2000] overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full overflow-y-auto overscroll-contain bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
          {/* Header */}
          <div className="relative p-6 pt-12 sm:pt-6">
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

            {!session ? (
              <div className="px-6">
                <AuthForm />
              </div>
            ) : (
              <ProfileContent 
                profile={profile}
                avatarSeed={avatarSeed}
                onAvatarChange={async () => {
                  const newSeed = Math.random().toString(36).substring(7);
                  try {
                    const { error } = await supabase
                      .from('user_stats')
                      .update({ avatar_seed: newSeed })
                      .eq('user_id', session.user.id);

                    if (error) throw error;
                    setAvatarSeed(newSeed);
                  } catch (err) {
                    console.error('Error updating avatar:', err);
                  }
                }}
                onLogout={handleLogout}
                isDark={isDark}
                onToggleTheme={() => setIsDark(!isDark)}
              />
            )}
          </div>
      </div>
    </>
  );
}