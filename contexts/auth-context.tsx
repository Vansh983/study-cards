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

    // // Handle redirect result if using signInWithRedirect
    // // If using signInWithPopup, this might not be necessary
    // getRedirectResult(auth)
    //   .then((result) => {
    //     if (result) {
    //       console.log('getRedirectResult', result);
    //       // Optionally, you can set the user here if needed
    //       setUser(result.user);
    //     }
    //   })
    //   .catch((error) => {
    //     console.error('Error handling redirect result:', error);
    //   });

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('onAuthStateChanged', currentUser);

      setUser(currentUser);
      setLoading(false);
      console.log(
        currentUser
          ? `User signed in: ${currentUser.displayName}`
          : 'No user signed in'
      );
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
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