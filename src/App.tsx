import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Map } from './components/Map';
import { Profile } from './components/Profile';
import { supabase } from './lib/supabase';
import { LoadingScreen } from './components/LoadingScreen';

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
    return <LoadingScreen />;
  }
  
  return (
    <BrowserRouter>
      <div className="relative h-screen">
        <Map 
          onProfileClick={() => setIsProfileOpen(true)} 
          isProfileOpen={isProfileOpen}
          session={session}
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