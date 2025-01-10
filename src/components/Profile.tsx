import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AuthForm } from './AuthForm';
import type { UserStats } from '../lib/supabase';
import { BADGES } from '../lib/supabase';

interface UserProfile {
  username: string;
  email: string;
  stats?: UserStats;
}

interface ProfileProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
}

export function Profile({ isOpen, onClose, session }: ProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      loadProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
    
    // Ascolta l'evento di ricaricamento del profilo
    const handleReload = () => loadProfile();
    window.addEventListener('reload-profile', handleReload);
    
    return () => {
      window.removeEventListener('reload-profile', handleReload);
    };
  }, [session]); // Aggiungi session come dipendenza

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // Get user metadata
      const { data: metadata } = await supabase.auth.getUser();
      const username = metadata.user?.user_metadata?.username || '';

      // Get user stats
      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // If no stats exist yet, create default stats
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
          stats: newStats
        });
      } else {
        setProfile({
          username,
          email: user.email!,
          stats
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

      setProfile(prev => prev ? { ...prev, username } : null);
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
        className={`fixed inset-y-0 left-0 w-full sm:w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-[2000] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full overflow-y-auto">
          <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-2xl font-bold border-2 border-green-200">
                  {profile?.username ? profile.username.charAt(0).toUpperCase() : '👤'}
                </div>
                {profile?.stats?.level && (
                  <div className="absolute -bottom-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                    {profile.stats.level}
                  </div>
                )}
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {session ? (profile?.username || 'Il tuo profilo') : 'Accedi'}
                </h1>
                {profile && (
                  <p className="text-sm text-gray-600">{profile.email}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
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
                        className="flex-1 p-2 border rounded-lg focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
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
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex-1 text-gray-900">
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statistiche
                  </label>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Livello {profile?.stats?.level || 1}</span>
                        <span className="text-sm text-gray-600">{profile?.stats?.xp || 0} XP</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${((profile?.stats?.xp || 0) % 100) / 100 * 100}%`
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {profile?.stats?.reports_submitted || 0}
                        </div>
                        <div className="text-sm text-gray-600">
                          Segnalazioni Inviate
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {profile?.stats?.reports_verified || 0}
                        </div>
                        <div className="text-sm text-gray-600">
                          Verifiche Effettuate
                        </div>
                      </div>
                    </div>

                    {profile?.stats?.badges && profile.stats.badges.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Badge Ottenuti</h3>
                        <div className="grid grid-cols-1 gap-3">
                          {Object.values(BADGES).map(badge => (
                            profile.stats?.badges.includes(badge.id) && (
                              <div
                                key={badge.id}
                                className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                              >
                                <span className="text-3xl mr-3">{badge.icon}</span>
                                <div>
                                  <div className="font-medium">{badge.name}</div>
                                  <div className="text-sm text-gray-600">{badge.description}</div>
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Esci
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        </div>
      </div>
    </>
  );
}