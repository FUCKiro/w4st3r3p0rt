import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Map } from './components/Map';
import { Profile } from './components/Profile';
import { ResetPassword } from './components/ResetPassword';
import { supabase } from './lib/supabase';
import { TutorialOverlay } from './components/TutorialOverlay';
import { OfflineIndicator } from './components/OfflineIndicator';
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
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={
            <>
              <TutorialOverlay />
              <OfflineIndicator />
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
            </>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;