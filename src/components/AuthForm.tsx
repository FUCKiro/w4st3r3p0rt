import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
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
        <h2 className="text-2xl font-bold text-gray-900">
          Benvenuto su Waste Monitor
        </h2>
        <p className="text-gray-600">
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Nome Utente"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
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
              className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm ${
                isLogin && !username ? 'rounded-t-md' : ''
              }`}
              placeholder="Indirizzo Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {!isLogin && (
                <div className="mt-2 text-sm text-gray-600 space-y-1">
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
          <div className="text-red-500 text-sm text-center">{error}</div>
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
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-green-600 hover:text-green-500"
          >
            {isLogin
              ? "Non hai un account? Registrati"
              : 'Hai già un account? Accedi'}
          </button>
        </div>
      </form>
    </div>
  );
}