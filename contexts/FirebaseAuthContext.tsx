'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signOut: async () => {},
});

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) return;
      void (async () => {
        const ref = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(ref);
        if (!userDoc.exists() && currentUser.displayName) {
          await setDoc(ref, {
            name: currentUser.displayName,
            email: currentUser.email,
            createdAt: new Date().toISOString(),
          });
        }
      })().catch(error => console.error('Could not sync user profile:', error));
    }, (error) => {
      console.error('Could not restore authentication:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Create or update user profile in Firestore
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          name: result.user.displayName || 'User',
          email: result.user.email,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if email is verified
      if (!result.user.emailVerified) {
        await firebaseSignOut(auth);
        throw new Error('Please verify your email before signing in. Check your inbox for the verification link.');
      }
    } catch (error: any) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      await updateProfile(result.user, {
        displayName: name
      });
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        name: name,
        email: email,
        createdAt: new Date().toISOString(),
      });
      
      // Send verification email
      await sendEmailVerification(result.user);
      
      // Sign out the user until they verify their email
      await firebaseSignOut(auth);
      
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useFirebaseAuth = () => useContext(AuthContext);
