import { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      console.error("Could not login, an error occurred!");
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Signup Function (Added since we need a way to create accounts)
  const signup = useCallback(async (email, password) => {
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      console.error("Signup Error!");
    } finally {
      setLoading(false);
    }
  }, []);

  // 4. Logout Function
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await signOut(auth);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      console.error("Logout Error!");
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    currentUser,
    login,
    signup,
    logout,
    loading
  }), [currentUser, login, signup, logout, loading]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};