import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
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
  const [showLoading, setShowLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileStats, setProfileStats] = useState<any>(null);

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

  useEffect(() => {
    const handleStatsUpdate = (event: CustomEvent<{ stats: any }>) => {
      setProfileStats(event.detail.stats);
    };
    
    window.addEventListener('update-profile-stats', handleStatsUpdate as EventListener);
    
    return () => {
      window.removeEventListener('update-profile-stats', handleStatsUpdate as EventListener);
    };
  }, []);

  if (!initialized || showLoading) {
    return <LoadingScreen onLoadingComplete={() => setShowLoading(false)} />;
  }
  
  return (
    <HashRouter>
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
                stats={profileStats}
              />
            </>
          } />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;