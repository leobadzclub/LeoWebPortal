import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// Get user profile
export async function getUserProfile(userId) {
  try {
    const docRef = doc(db, 'profiles', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting profile:', error);
    throw error;
  }
}

// Create or update user profile
export async function saveUserProfile(userId, profileData) {
  try {
    const docRef = doc(db, 'profiles', userId);
    await setDoc(docRef, {
      ...profileData,
      updatedAt: new Date(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
}

// Check if profile is complete
export function isProfileComplete(profile) {
  if (!profile) return false;
  
  const requiredFields = ['phone', 'skillLevel'];
  return requiredFields.every(field => profile[field]);
}

// Update specific profile field
export async function updateProfileField(userId, field, value) {
  try {
    const docRef = doc(db, 'profiles', userId);
    await updateDoc(docRef, {
      [field]: value,
      updatedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error('Error updating profile field:', error);
    throw error;
  }
}
