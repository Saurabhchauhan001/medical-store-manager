import { useEffect, useState } from 'react';
import api from '../lib/api';
import { AuthContext } from './auth-context';
const STORAGE_KEY = 'pharmasync.auth.user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const storedUser = window.localStorage.getItem(STORAGE_KEY);

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to restore session', error);
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setReady(true);
    }
  }, []);

  const persistUser = (nextUser) => {
    setUser(nextUser);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
  };

  const loginWithGoogle = async (credential) => {
    const response = await api.post('/auth/google', { credential });
    persistUser(response.data.user);
    return response.data.user;
  };

  const loginAsDemo = () => {
    const demoUser = {
      id: 'demo-admin',
      name: 'Demo Admin',
      email: 'demo@pharmasync.local',
      picture: '',
      provider: 'demo',
    };

    persistUser(demoUser);
    return demoUser;
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);

    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ready,
        user,
        isAuthenticated: Boolean(user),
        loginWithGoogle,
        loginAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
