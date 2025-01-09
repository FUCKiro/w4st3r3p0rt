import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Map } from './components/Map';
import { Profile } from './components/Profile';
import { supabase } from './lib/supabase';

function App() {
  const [session, setSession] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!initialized) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-600">Caricamento...</div>
    </div>;
  }
  
  return (
    <BrowserRouter>
      <div className="relative h-screen">
        <Map 
          onProfileClick={() => setIsProfileOpen(true)} 
          isProfileOpen={isProfileOpen}
        />
        <Profile 
          isOpen={isProfileOpen} 
          onClose={() => setIsProfileOpen(false)}
          session={session}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;