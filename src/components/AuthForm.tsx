import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setValidationErrors({ username: '', email: '', password: '' });

    try {
      const resetUrl = `${import.meta.env.VITE_SITE_URL}/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: resetUrl
      });

      if (error) throw error;

      setResetSuccess(true);
      alert(`Ti abbiamo inviato un'email con le istruzioni per reimpostare la password.\n\nIMPORTANTE:\n1. Controlla la tua casella di posta (anche lo spam)\n2. Clicca sul link nell'email\n3. Verrai reindirizzato alla pagina di reset dove potrai inserire la nuova password`);
      setShowResetForm(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Funzione di validazione
  const validateForm = () => {
    const errors = {
      username: '',
      email: '',
      password: ''
    };
    
    // Validazione username
    if (!isLogin) {
      if (!username) {
        errors.username = 'Il nome utente è obbligatorio';
      } else if (username.length < 3) {
        errors.username = 'Il nome utente deve essere di almeno 3 caratteri';
      } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.username = 'Il nome utente può contenere solo lettere, numeri e underscore';
      }
    }

    // Validazione email
    if (!email) {
      errors.email = 'L\'email è obbligatoria';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Inserisci un indirizzo email valido';
    }

    // Validazione password
    if (!password) {
      errors.password = 'La password è obbligatoria';
    } else if (password.length < 8) {
      errors.password = 'La password deve essere di almeno 8 caratteri';
    } else if (!/[A-Z]/.test(password)) {
      errors.password = 'La password deve contenere almeno una lettera maiuscola';
    } else if (!/[a-z]/.test(password)) {
      errors.password = 'La password deve contenere almeno una lettera minuscola';
    } else if (!/[0-9]/.test(password)) {
      errors.password = 'La password deve contenere almeno un numero';
    } else if (!/[!@#$%^&*]/.test(password)) {
      errors.password = 'La password deve contenere almeno un carattere speciale (!@#$%^&*)';
    }

    setValidationErrors(errors);
    return !errors.username && !errors.email && !errors.password;
  };

  // Verifica username unico
  const checkUsernameUnique = async (username: string) => {
    const { data, error } = await supabase
      .from('user_stats')
      .select('user_id')
      .eq('username', username);
    
    if (error) {
      console.error('Error checking username:', error);
      return false;
    }
    
    return !data || data.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setValidationErrors({ username: '', email: '', password: '' });

    // Validazione form
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        // Verifica username unico
        const isUnique = await checkUsernameUnique(username);
        if (!isUnique) {
          setValidationErrors(prev => ({
            ...prev,
            username: 'Questo nome utente è già in uso'
          }));
          setLoading(false);
          return;
        }

        const { data: { user }, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
          },
        });
        if (error) throw error;

        // Create initial user stats
        if (user) {
          const { error: statsError } = await supabase
            .from('user_stats')
            .insert({
              user_id: user.id,
              username: username,
              xp: 0,
              level: 1,
              reports_submitted: 0,
              reports_verified: 0,
              badges: []
            });
          
          if (statsError) {
            console.error('Error creating user stats:', statsError);
          }
        }
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Benvenuto su Waste Monitor
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Unisciti alla nostra comunità per rendere il mondo più pulito.
          Segnala, verifica e monitora i rifiuti abbandonati nella tua zona.
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm -space-y-px">
          {!isLogin && (
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 ${
                  validationErrors.username ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm`}
                placeholder="Nome Utente"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {validationErrors.username && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.username}</p>
              )}
            </div>
          )}
          <div>
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`appearance-none rounded-none relative block w-full px-3 py-2 border dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 ${
                validationErrors.email ? 'border-red-300' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm ${
                isLogin && !username ? 'rounded-t-md' : ''
              }`}
              placeholder="Indirizzo Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 ${
                  validationErrors.password ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.password}</p>
              )}
              {!isLogin && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>La password deve contenere:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li className={`${password.length >= 8 ? 'text-green-600' : ''}`}>
                      Almeno 8 caratteri
                    </li>
                    <li className={`${/[A-Z]/.test(password) ? 'text-green-600' : ''}`}>
                      Almeno una lettera maiuscola
                    </li>
                    <li className={`${/[a-z]/.test(password) ? 'text-green-600' : ''}`}>
                      Almeno una lettera minuscola
                    </li>
                    <li className={`${/[0-9]/.test(password) ? 'text-green-600' : ''}`}>
                      Almeno un numero
                    </li>
                    <li className={`${/[!@#$%^&*]/.test(password) ? 'text-green-600' : ''}`}>
                      Almeno un carattere speciale (!@#$%^&*)
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="text-red-500 dark:text-red-400 text-sm text-center">{error}</div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {loading ? 'Elaborazione...' : isLogin ? 'Accedi' : 'Registrati'}
          </button>
        </div>

        <div className="text-sm text-center">
          {isLogin && (
            <button
              type="button"
              onClick={() => setShowResetForm(true)}
              className="font-medium text-green-600 dark:text-green-500 hover:text-green-500 dark:hover:text-green-400 mb-4 block w-full"
            >
              Password dimenticata?
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-green-600 dark:text-green-500 hover:text-green-500 dark:hover:text-green-400"
          >
            {isLogin
              ? "Non hai un account? Registrati"
              : 'Hai già un account? Accedi'}
          </button>
        </div>
      </form>

      {/* Form di reset password */}
      {showResetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Ripristina Password
            </h3>
            {resetSuccess ? (
              <div className="text-center">
                <p className="text-green-600 mb-4">
                  Se l'indirizzo email è registrato, riceverai le istruzioni per reimpostare la password.
                </p>
                <button
                  onClick={() => {
                    setShowResetForm(false);
                    setResetSuccess(false);
                    setResetEmail('');
                  }}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Chiudi
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div className="mb-4">
                  <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                {error && (
                  <p className="text-red-600 text-sm mb-4">{error}</p>
                )}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetForm(false);
                      setResetEmail('');
                      setError(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Invio...' : 'Invia'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}