import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Ottieni i parametri dall'URL
    const params = new URLSearchParams(window.location.hash.replace('#/reset-password?', ''));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const type = params.get('type');

    if (!accessToken || type !== 'recovery') {
      console.error('Invalid or missing reset password parameters');
      navigate('/');
      return;
    }

    // Imposta il token nella sessione
    (async () => {
      try {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
        
        if (error) {
          console.error('Error setting session:', error);
          navigate('/');
          return;
        }

        // Se tutto ok, mostra il form di reset
        setLoading(false);
      } catch (err) {
        console.error('Error setting session:', err);
        navigate('/');
      }
    })();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
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

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setSuccess(true);
            
      // Effettua il logout
      await supabase.auth.signOut();
      
      // Reindirizza dopo un breve delay
      setTimeout(() => {
        alert('Password aggiornata con successo! Verrai reindirizzato alla pagina di login.');
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('Error resetting password:', err);
      setError('Errore durante il reset della password. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reimposta la tua password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Password aggiornata con successo
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Verrai reindirizzato alla pagina di login tra pochi secondi.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Nuova Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>
                {/* Password requirements */}
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <p>La password deve contenere:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li className={`${newPassword.length >= 8 ? 'text-green-600' : ''}`}>
                      Almeno 8 caratteri
                    </li>
                    <li className={`${/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}`}>
                      Almeno una lettera maiuscola
                    </li>
                    <li className={`${/[a-z]/.test(newPassword) ? 'text-green-600' : ''}`}>
                      Almeno una lettera minuscola
                    </li>
                    <li className={`${/[0-9]/.test(newPassword) ? 'text-green-600' : ''}`}>
                      Almeno un numero
                    </li>
                    <li className={`${/[!@#$%^&*]/.test(newPassword) ? 'text-green-600' : ''}`}>
                      Almeno un carattere speciale (!@#$%^&*)
                    </li>
                  </ul>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Errore nel reset della password
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  {loading ? 'Aggiornamento...' : 'Aggiorna Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}