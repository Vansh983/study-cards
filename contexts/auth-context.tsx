'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Initializing authentication state...');
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      console.log(
        currentUser
          ? `User signed in: ${currentUser.displayName}`
          : 'No user signed in'
      );
    });

    return () => {
      console.log('Unsubscribing from auth state changes');
      unsubscribe();
    };
  }, []);

  // Debug current auth state
  useEffect(() => {
    console.log('Current auth state:', user?.email || 'no user');
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 