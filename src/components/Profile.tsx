import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AuthForm } from './AuthForm';
import type { UserStats, WasteReport } from '../lib/supabase';
import { BADGES, WASTE_IMPACT, SIZE_MULTIPLIER } from '../lib/supabase';
import { Moon, Sun } from 'lucide-react';

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
}

export function Profile({ isOpen, onClose, session }: ProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'reports' | 'impact'>('stats');
  const [isDark, setIsDark] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');

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
          <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 text-2xl font-bold border-2 border-green-200 dark:border-green-700">
                  {profile?.username ? profile.username.charAt(0).toUpperCase() : '👤'}
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">{profile.email}</p>
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
                </div>

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
                <div className="flex border-b border-gray-200 mb-6">
                  <button
                    onClick={() => setActiveTab('stats')}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'stats'
                        ? 'border-green-600 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Statistiche
                  </button>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'reports'
                        ? 'border-green-600 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Le Mie Segnalazioni
                  </button>
                  <button
                    onClick={() => setActiveTab('impact')}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'impact'
                        ? 'border-green-600 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Impatto Ambientale
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
                            <span className="text-sm text-gray-600 dark:text-gray-400">Livello {profile?.stats?.level || 1}</span>
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
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Badge Ottenuti</h3>
                            <div className="grid grid-cols-1 gap-3">
                              {Object.values(BADGES).map(badge => (
                                profile.stats?.badges.includes(badge.id) && (
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
                                )
                              ))}
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
                        
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <h3 className="font-medium mb-3">Dettaglio per Tipo di Rifiuto</h3>
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
                                <span className="text-gray-600">
                                  {['Rifiuti Urbani', 'Rifiuti Ingombranti', 'Materiali Pericolosi', 'Discarica Abusiva', 'Rifiuti Verdi'][Number(type)]}
                                </span>
                                <span className="font-medium">{weight.toFixed(0)} kg</span>
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
                ) : null}
                <div className="pt-6 border-t">
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="w-full px-4 py-2 mb-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cambia Password
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Esci
                  </button>
                </div>

                {/* Form cambio password */}
                {showPasswordForm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Cambia Password
                      </h3>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          // Validazione password
                          if (newPassword.length < 8 || 
                              !/[A-Z]/.test(newPassword) || 
                              !/[a-z]/.test(newPassword) || 
                              !/[0-9]/.test(newPassword) || 
                              !/[!@#$%^&*]/.test(newPassword)) {
                            setError('La password non soddisfa i requisiti minimi di sicurezza');
                            return;
                          }

                          const { error } = await supabase.auth.updateUser({
                            password: newPassword
                          });

                          if (error) throw error;

                          alert('Password aggiornata con successo!');
                          setShowPasswordForm(false);
                          setNewPassword('');
                          setError(null);
                        } catch (err) {
                          setError((err as Error).message);
                        }
                      }}>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nuova Password
                          </label>
                          <input
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
                          <p className="text-red-600 dark:text-red-400 text-sm mb-4">{error}</p>
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
              </div>
              <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500 dark:text-gray-400">
                Ideato e Sviluppato da Fabio La Rocca
                <button
                  onClick={() => window.alert('Waste Monitor v1.0\n\nQuesta applicazione è stata creata per aiutare i cittadini a segnalare e monitorare i rifiuti abbandonati nella propria zona.\n\nTutti i diritti riservati © 2025\nIdeato e Sviluppato da Fabio La Rocca')}
                  className="ml-2 p-1 text-green-600 hover:text-green-700 rounded-full hover:bg-green-50 transition-colors"
                  title="Informazioni sull'app"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
        </div>
      </div>
    </>
  );
}