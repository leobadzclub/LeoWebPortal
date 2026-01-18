import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Check if a user is an approved member
 * @param {string} email - User's email address
 * @param {string} phone - User's phone number
 * @returns {Promise<boolean>} - True if approved, false otherwise
 */
export async function checkMemberApproval(email, phone) {
  try {
    // Query registrations collection for matching email and phone
    const q = query(
      collection(db, 'member_registrations'),
      where('email', '==', email),
      where('phone', '==', phone),
      where('status', '==', 'approved')
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking member approval:', error);
    return false;
  }
}

/**
 * Sync member approval status to user's extended profile
 * @param {string} userId - Firebase Auth user ID
 * @param {string} email - User's email
 * @param {string} phone - User's phone number
 */
export async function syncMemberApprovalStatus(userId, email, phone) {
  try {
    const isApproved = await checkMemberApproval(email, phone);
    
    // Update extended profile
    const profileRef = doc(db, 'profiles', userId);
    await setDoc(profileRef, {
      approved: isApproved,
      lastChecked: new Date(),
    }, { merge: true });
    
    return isApproved;
  } catch (error) {
    console.error('Error syncing approval status:', error);
    return false;
  }
}

/**
 * Get pending registrations (for admin review)
 */
export async function getPendingRegistrations() {
  try {
    const q = query(
      collection(db, 'member_registrations'),
      where('status', '==', 'pending')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting pending registrations:', error);
    return [];
  }
}
