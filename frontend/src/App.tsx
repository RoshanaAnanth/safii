import React, { useState, useEffect } from 'react';
import LoginScreen from './screens/LoginScreen/LoginScreen';

import supabase from './lib/supabase';

const App: React.FC = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        console.log('Logged in user:', data.user);
      } else {
        console.log('No user found');
      }
    };

    fetchUser();
  }, []);
  
  return (
    <div className="app">
      {user !== null ? 
      <h1>Welcome, {user.name}</h1> : 
      <LoginScreen />
      }
    </div>
  );
};

export default App;