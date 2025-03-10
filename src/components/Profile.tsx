import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AuthForm } from './AuthForm';
import { X, Moon, Sun, BarChart2, ScrollText, Leaf, Info, Trophy } from 'lucide-react';
import { InfoDialog } from './InfoDialog';
import { ProfileStats } from './profile/ProfileStats';
import { ProfileReports } from './profile/ProfileReports';
import { ProfileImpact } from './profile/ProfileImpact';
import { ProfileAchievements } from './profile/ProfileAchievements';
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
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'reports' | 'impact' | 'achievements'>('stats');
  const [isDark, setIsDark] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

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

      setUsername(username);
      setError(null);
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Errore nel caricamento del profilo. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.auth.updateUser({
        data: { username }
      });

      if (error) throw error;

      setProfile((prev: any) => prev ? { ...prev, username } : null);
      setEditing(false);
      setError(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
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
        <div className="h-full overflow-y-auto overscroll-contain">
          <div className="p-6 pt-12 sm:pt-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 text-2xl font-bold border-2 border-green-200 dark:border-green-700">
                    {avatarSeed ? (
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=ffffff`}
                        alt="Avatar"
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      profile?.username ? profile.username.charAt(0).toUpperCase() : '👤'
                    )}
                  </div>
                  {profile?.stats?.level && (
                    <div className="absolute -bottom-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                      {profile.stats.level}
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {session ? (profile?.username || 'Il tuo profilo') : 'Accedi'}
                  </h1>
                  {profile && (
                    <>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{profile.email}</p>
                      {profile.stats?.level && (
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                          {getUserTitle(profile.stats.level)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {!session ? (
              <AuthForm />
            ) : (
              <>
                {error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nome Utente
                    </label>
                    {editing ? (
                      <div className="mt-1 flex space-x-2">
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="flex-1 p-2 border rounded-lg focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={updateProfile}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Salva
                        </button>
                        <button
                          onClick={() => {
                            setEditing(false);
                            setUsername(profile?.username || '');
                          }}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Annulla
                        </button>
                      </div>
                    ) : (
                      <div className="mt-1 flex justify-between items-center">
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex-1 text-gray-900 dark:text-white">
                          {profile?.username}
                        </div>
                        <button
                          onClick={() => setEditing(true)}
                          className="ml-2 text-green-600 hover:text-green-700 transition-colors"
                        >
                          Modifica
                        </button>
                      </div>
                    )}
                    <button
                      onClick={async () => {
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
                      className="mt-2 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                    >
                      Cambia Avatar
                    </button>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <button
                      onClick={() => setShowPasswordForm(true)}
                      className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cambia Password
                    </button>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Tema {isDark ? 'Scuro' : 'Chiaro'}
                      </span>
                      <button
                        onClick={() => setIsDark(!isDark)}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-x-1 gap-y-2 border-b border-gray-200 mb-6 pb-2">
                    <button
                      onClick={() => setActiveTab('stats')}
                      className={`flex-1 py-3 text-sm font-medium border-b-2 flex flex-col items-center ${
                        activeTab === 'stats'
                          ? 'border-green-600 text-green-600 dark:text-green-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 '}`}
                      title="Statistiche"
                      aria-label="Statistiche"
                    >
                      <BarChart2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveTab('reports')}
                      className={`flex-1 py-3 text-sm font-medium border-b-2 flex flex-col items-center ${
                        activeTab === 'reports'
                          ? 'border-green-600 text-green-600 dark:text-green-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                      title="Le Mie Segnalazioni"
                      aria-label="Le Mie Segnalazioni"
                    >
                      <ScrollText className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveTab('impact')}
                      className={`flex-1 py-3 text-sm font-medium border-b-2 flex flex-col items-center ${
                        activeTab === 'impact'
                          ? 'border-green-600 text-green-600 dark:text-green-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                      title="Impatto Ambientale"
                      aria-label="Impatto Ambientale"
                    >
                      <Leaf className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveTab('achievements')}
                      className={`flex-1 py-3 text-sm font-medium border-b-2 flex flex-col items-center ${
                        activeTab === 'achievements'
                          ? 'border-green-600 text-green-600 dark:text-green-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                      title="Obiettivi"
                      aria-label="Obiettivi"
                    >
                      <Trophy className="w-5 h-5" />
                    </button>
                  </div>

                  {activeTab === 'stats' && profile?.stats && (
                    <ProfileStats stats={profile.stats} />
                  )}

                  {activeTab === 'reports' && profile?.reports && (
                    <ProfileReports reports={profile.reports} />
                  )}

                  {activeTab === 'impact' && profile?.reports && (
                    <ProfileImpact reports={profile.reports} />
                  )}

                  {activeTab === 'achievements' && profile?.stats?.badges && (
                    <ProfileAchievements badges={profile.stats.badges} />
                  )}

                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-center">
                    <button
                      onClick={() => setShowInfo(true)}
                      className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xs"
                    >
                      <Info className="w-5 h-5" />
                      <span>Ideato e Sviluppato da Fabio La Rocca. ©2025 Tutti i diritti riservati.</span>
                    </button>
                  </div>

                  <div className="pt-6 border-t">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors dark:bg-red-700 dark:hover:bg-red-800"
                    >
                      Esci
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <InfoDialog isOpen={showInfo} onClose={() => setShowInfo(false)} />
      </div>
    </>
  );
}