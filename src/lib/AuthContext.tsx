// src/lib/AuthContext.tsx
'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence,
  getIdToken
} from 'firebase/auth';
import { auth, db } from './firebase';
import { setDoc, doc, getDoc } from 'firebase/firestore';

// Define the User type
type User = {
  id: string;
  email: string | null;
  name?: string | null;
  photoURL?: string | null;
};

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys
const USER_STORAGE_KEY = 'coursegpt_user';
const AUTH_CHECKED_KEY = 'auth_checked';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Configure auth persistence when component mounts
  useEffect(() => {
    // Set browser persistence so auth state survives page reloads
    setPersistence(auth, browserLocalPersistence);
    
    // Try to load cached user first to prevent flickering UI
    const cachedUserJson = localStorage.getItem(USER_STORAGE_KEY);
    if (cachedUserJson) {
      try {
        const cachedUser = JSON.parse(cachedUserJson);
        setCurrentUser(cachedUser);
        setLoading(false);
      } catch (e) {
        console.error("Error parsing cached user:", e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // This will only run on initial load and when auth state actually changes
      if (firebaseUser) {
        try {
          // Get additional user data from Firestore if needed
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          
          const userData: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || userDoc.data()?.name || null,
            photoURL: firebaseUser.photoURL || null,
          };
          
          // Cache user data in localStorage
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
          localStorage.setItem(AUTH_CHECKED_KEY, 'true');
          
          setCurrentUser(userData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        // User is signed out
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.setItem(AUTH_CHECKED_KEY, 'true');
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Cleanup function
    return () => unsubscribe();
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get additional user data from Firestore
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || userDoc.data()?.name || null,
        photoURL: firebaseUser.photoURL || null,
      };
      
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      setCurrentUser(userData);
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        email,
        name,
        createdAt: new Date().toISOString()
      });
      
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: name,
        photoURL: null,
      };
      
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      setCurrentUser(userData);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      
      // Check if user exists in Firestore, if not create a new document
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          createdAt: new Date().toISOString()
        });
      }
      
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || null,
        photoURL: firebaseUser.photoURL || null,
      };
      
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      setCurrentUser(userData);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem(USER_STORAGE_KEY);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    currentUser,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}