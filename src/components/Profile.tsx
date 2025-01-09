import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface UserProfile {
  username: string;
  email: string;
  reports_count?: number;
}

export function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user metadata
      const { data: metadata } = await supabase.auth.getUser();
      const username = metadata.user?.user_metadata?.username || '';

      // Get reports count
      const { count } = await supabase
        .from('waste_reports')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setProfile({
        username,
        email: user.email!,
        reports_count: count || 0
      });
      setUsername(username);
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile');
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
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out');
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
    <div className="min-h-screen bg-gray-50 relative">
      <div className="max-w-lg mx-auto pt-12 px-4">
        <Link
          to="/"
          className="absolute top-4 left-4 flex items-center text-green-600 hover:text-green-700"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Torna alla Mappa
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Impostazioni Profilo</h1>
          </div>
        
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                {profile?.email}
              </div>
            </div>

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
                    className="flex-1 p-2 border rounded-lg focus:ring-green-500 focus:border-green-500"
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
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex-1">
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
              <label className="block text-sm font-medium text-gray-700">
                Segnalazioni Inviate
              </label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                {profile?.reports_count} segnalazioni
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
        </div>
      </div>
    </div>
  );
}