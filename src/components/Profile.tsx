import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AuthForm } from './AuthForm';
import type { UserStats, WasteReport } from '../lib/supabase';
import { BADGES, WASTE_IMPACT, SIZE_MULTIPLIER, getUserTitle, TITLES } from '../lib/supabase';
import { Moon, Sun, BarChart2, ScrollText, Leaf, Info, Trophy } from 'lucide-react';
import { InfoDialog } from './InfoDialog';

interface UserProfile {
  username: string;
  email: string;
  stats?: UserStats;
  reports?: WasteReport[];
}

interface ProfileProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
  stats?: any;
}

export function Profile({ isOpen, onClose, session, stats }: ProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'reports' | 'impact' | 'achievements'>('stats');
  const [isDark, setIsDark] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [avatarSeed, setAvatarSeed] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    // Controlla il tema salvato o la preferenza del sistema
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    setIsDark(savedTheme === 'dark' || (!savedTheme && prefersDark));
  }, []);

  useEffect(() => {
    // Applica il tema
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
  }, [session]); // Aggiungi session come dipendenza

  // Aggiorna il profilo quando cambiano le statistiche
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

      // Get user metadata
      const { data: metadata } = await supabase.auth.getUser();
      const username = metadata.user?.user_metadata?.username || '';

      // Get avatar seed
      const { data: avatarData } = await supabase
        .from('user_stats')
        .select('avatar_seed')
        .eq('user_id', user.id)
        .single();

      if (avatarData?.avatar_seed) {
        setAvatarSeed(avatarData.avatar_seed);
      }

      // Get user stats
      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get user reports
      const { data: reports } = await supabase
        .from('waste_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

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
                {profile?.stats?.level ? (
                  <div className="absolute -bottom-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                    {profile.stats.level}
                  </div>
                ) : null}
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
                
                {/* Password Reset Form */}
                <div className="mt-6 pt-6 border-t">
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cambia Password
                  </button>
                </div>

                {showPasswordForm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-[2001] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Cambia Password
                      </h3>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        
                        // Validazione password
                        if (newPassword.length < 8 || 
                            !/[A-Z]/.test(newPassword) || 
                            !/[a-z]/.test(newPassword) || 
                            !/[0-9]/.test(newPassword) || 
                            !/[!@#$%^&*]/.test(newPassword)) {
                          setError('La password non soddisfa i requisiti minimi di sicurezza');
                          return;
                        }

                        try {
                          const { error } = await supabase.auth.updateUser({
                            password: newPassword
                          });

                          if (error) throw error;

                          alert('Password aggiornata con successo!');
                          setShowPasswordForm(false);
                          setNewPassword('');
                          setError(null);
                        } catch (err) {
                          console.error('Error updating password:', err);
                          setError('Errore durante l\'aggiornamento della password');
                        }
                      }}>
                        <div className="mb-4">
                          <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nuova Password
                          </label>
                          <input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                            required
                          />
                          
                          {/* Password requirements */}
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p>La password deve contenere:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li className={`${newPassword.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}`}>
                                Almeno 8 caratteri
                              </li>
                              <li className={`${/[A-Z]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : ''}`}>
                                Almeno una lettera maiuscola
                              </li>
                              <li className={`${/[a-z]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : ''}`}>
                                Almeno una lettera minuscola
                              </li>
                              <li className={`${/[0-9]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : ''}`}>
                                Almeno un numero
                              </li>
                              <li className={`${/[!@#$%^&*]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : ''}`}>
                                Almeno un carattere speciale (!@#$%^&*)
                              </li>
                            </ul>
                          </div>
                        </div>

                        {error && (
                          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-md text-sm">
                            {error}
                          </div>
                        )}

                        <div className="flex space-x-3">
                          <button
                            type="button"
                            onClick={() => {
                              setShowPasswordForm(false);
                              setNewPassword('');
                              setError(null);
                            }}
                            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                          >
                            Annulla
                          </button>
                          <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Aggiorna
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Theme Toggle */}
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

                {/* Tabs */}
                <div className="grid grid-cols-4 gap-x-1 gap-y-2 border-b border-gray-200 mb-6 pb-2">
                  <button
                    onClick={() => setActiveTab('stats')}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 flex flex-col items-center ${
                      activeTab === 'stats'
                        ? 'border-green-600 text-green-600 dark:text-green-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
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

                {activeTab === 'stats' ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Statistiche
                      </label>
                      <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">Livello {profile?.stats?.level || 1}</span>
                              <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                                {getUserTitle(profile?.stats?.level || 1)}
                              </p>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{profile?.stats?.xp || 0} XP</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${((profile?.stats?.xp || 0) % 100) / 100 * 100}%`
                              }}
                            />
                          </div>
                          {profile?.stats?.level && profile.stats.level < 50 && (
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              Prossimo titolo: {getUserTitle(profile.stats.level + 1)} al livello {
                                Object.keys(TITLES || {})
                                  .map(Number)
                                  .sort((a, b) => a - b)
                                  .find(level => level > profile.stats!.level)
                              }
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                              {profile?.stats?.reports_submitted || 0}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Segnalazioni Inviate
                            </div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                              {profile?.stats?.reports_verified || 0}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Verifiche Effettuate
                            </div>
                          </div>
                        </div>

                        {profile?.stats?.badges && profile.stats.badges.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Ultimi Badge Ottenuti</h3>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {profile.stats.badges.length} totali
                              </span>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                              {profile.stats.badges.slice(-5).reverse().map(badgeId => {
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
                ) : activeTab === 'reports' ? (
                  <div className="space-y-4">
                    {profile?.reports && profile.reports.length > 0 ? (
                      profile.reports.map((report) => (
                        <div
                          key={report.id}
                          className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium dark:text-white">
                              {['Rifiuti Urbani', 'Rifiuti Ingombranti', 'Materiali Pericolosi', 'Discarica Abusiva', 'Rifiuti Verdi'][report.waste_type]}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              report.status === 'new' ? 'bg-blue-100 text-blue-800' :
                              report.status === 'verified' ? 'bg-yellow-100 text-yellow-800' :
                              report.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                              report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {report.status === 'new' ? 'Nuovo' :
                               report.status === 'verified' ? 'Verificato' :
                               report.status === 'in_progress' ? 'In Corso' :
                               report.status === 'resolved' ? 'Risolto' :
                               'Archiviato'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p>Dimensione: {
                              ['Piccolo (entra in un sacchetto)',
                               'Medio (entra in un\'auto)',
                               'Grande (necessita di un camion)',
                               'Molto Grande (discarica illegale)'][report.size]
                            }</p>
                            {report.notes && (
                              <p>Note: {report.notes}</p>
                            )}
                            <p>Data: {new Date(report.created_at).toLocaleDateString('it-IT', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Non hai ancora effettuato nessuna segnalazione
                      </div>
                    )}
                  </div>
                ) : activeTab === 'impact' ? (
                  <div className="space-y-6">
                    {profile?.reports && profile.reports.length > 0 ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                            <div className="text-2xl font-bold text-green-700 mb-1">
                              {profile.reports.reduce((total, report) => {
                                const impact = WASTE_IMPACT[report.waste_type as keyof typeof WASTE_IMPACT];
                                const multiplier = SIZE_MULTIPLIER[report.size as keyof typeof SIZE_MULTIPLIER];
                                return total + (impact.avg_weight * multiplier * impact.co2_per_kg);
                              }, 0).toFixed(1)} kg
                            </div>
                            <div className="text-sm text-green-600">
                              CO₂ Risparmiata
                            </div>
                          </div>
                          <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                            <div className="text-2xl font-bold text-green-700 mb-1">
                              {profile.reports.reduce((total, report) => {
                                const impact = WASTE_IMPACT[report.waste_type as keyof typeof WASTE_IMPACT];
                                const multiplier = SIZE_MULTIPLIER[report.size as keyof typeof SIZE_MULTIPLIER];
                                return total + (impact.avg_weight * multiplier);
                              }, 0).toFixed(0)} kg
                            </div>
                            <div className="text-sm text-green-600">
                              Rifiuti Recuperati
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                          <h3 className="font-medium mb-3 text-gray-900 dark:text-white">Dettaglio per Tipo di Rifiuto</h3>
                          <div className="space-y-3">
                            {Object.entries(
                              profile.reports.reduce((acc, report) => {
                                const type = report.waste_type;
                                if (!acc[type]) acc[type] = 0;
                                const impact = WASTE_IMPACT[type as keyof typeof WASTE_IMPACT];
                                const multiplier = SIZE_MULTIPLIER[report.size as keyof typeof SIZE_MULTIPLIER];
                                acc[type] += impact.avg_weight * multiplier;
                                return acc;
                              }, {} as Record<number, number>)
                            ).map(([type, weight]) => (
                              <div key={type} className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-300">
                                  {['Rifiuti Urbani', 'Rifiuti Ingombranti', 'Materiali Pericolosi', 'Discarica Abusiva', 'Rifiuti Verdi'][Number(type)]}
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">{weight.toFixed(0)} kg</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <h3 className="font-medium mb-3">Equivalente a:</h3>
                          <div className="space-y-2 text-sm text-gray-600">
                            {(() => {
                              const totalCO2 = profile.reports.reduce((total, report) => {
                                const impact = WASTE_IMPACT[report.waste_type as keyof typeof WASTE_IMPACT];
                                const multiplier = SIZE_MULTIPLIER[report.size as keyof typeof SIZE_MULTIPLIER];
                                return total + (impact.avg_weight * multiplier * impact.co2_per_kg);
                              }, 0);
                              
                              return (
                                <>
                                  <p>🚗 {(totalCO2 / 2.3).toFixed(0)} km percorsi in auto</p>
                                  <p>🌳 {(totalCO2 / 22).toFixed(1)} alberi necessari per un anno</p>
                                  <p>💡 {(totalCO2 * 3.3).toFixed(0)} ore di lampada LED accesa</p>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Nessun dato sull'impatto ambientale disponibile
                      </div>
                    )}
                  </div>                  
                ) : activeTab === 'achievements' ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Obiettivi
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {profile?.stats?.badges?.length || 0} di {Object.keys(BADGES).length} sbloccati
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {Object.values(BADGES).map((badge) => (
                        <div
                          key={badge.id}
                          className={`p-3 rounded-lg border transition-all ${
                            profile?.stats?.badges?.includes(badge.id)
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
                ) : null}
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