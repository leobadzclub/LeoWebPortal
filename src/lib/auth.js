'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import { getUserProfile } from './profile';
import { syncMemberApprovalStatus } from './memberApproval';
import ProfileCompletionModal from '../components/ProfileCompletionModal';
import RegistrationSuccessMessage from '../components/RegistrationSuccessMessage';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [extendedProfile, setExtendedProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch or create user profile
        await fetchOrCreateUserProfile(firebaseUser);
      } else {
        setUser(null);
        setUserProfile(null);
        setExtendedProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Real-time listener for profile updates
  useEffect(() => {
    if (!user) return;

    // Listen to profiles collection for real-time updates
    const profileRef = doc(db, 'profiles', user.uid);
    const unsubscribe = onSnapshot(profileRef, (doc) => {
      if (doc.exists()) {
        setExtendedProfile({ id: doc.id, ...doc.data() });
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Real-time listener for user profile updates
  useEffect(() => {
    if (!user) return;

    // Listen to users collection for real-time updates
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        setUserProfile(doc.data());
      }
    });

    return () => unsubscribe();
  }, [user]);

  const fetchOrCreateUserProfile = async (firebaseUser) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // User exists - load their profile
        setUserProfile(userSnap.data());
      } else {
        // New user - DON'T create profile yet
        // Wait for them to complete registration
        setUserProfile(null);
      }
      
      // Check for extended profile
      const profile = await getUserProfile(firebaseUser.uid);
      
      if (profile) {
        // Profile exists - user has completed registration
        // Only sync approval status if profile doesn't have an approval field set yet
        // This prevents overriding manual admin approvals
        if (profile?.email && profile?.phone && profile.approved === undefined) {
          await syncMemberApprovalStatus(firebaseUser.uid, profile.email, profile.phone);
          // Refresh profile after sync
          const updatedProfile = await getUserProfile(firebaseUser.uid);
          setExtendedProfile(updatedProfile);
        } else {
          // Use existing profile with manual approval status
          setExtendedProfile(profile);
        }
      } else {
        // No profile - new user, show registration modal
        setExtendedProfile(null);
      }
      
      // Show profile completion modal if profile not complete
      // This is the ONLY way users can register in the database
      if (!profile || !profile.profileComplete) {
        setShowProfileModal(true);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };
  
  const handleProfileComplete = async () => {
    setShowProfileModal(false);
    // Refresh extended profile
    if (user) {
      const profile = await getUserProfile(user.uid);
      setExtendedProfile(profile);
    }
  };

  const handleRegistrationSuccess = () => {
    setShowRegistrationSuccess(true);
    // Auto-hide after 10 seconds
    setTimeout(() => {
      setShowRegistrationSuccess(false);
    }, 10000);
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
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

  const value = {
    user,
    userProfile,
    extendedProfile,
    loading,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showProfileModal && user && (
        <ProfileCompletionModal 
          user={user} 
          onComplete={handleProfileComplete}
          onRegistrationSuccess={handleRegistrationSuccess}
        />
      )}
      {showRegistrationSuccess && <RegistrationSuccessMessage />}
    </AuthContext.Provider>
  );
}