import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, addDoc, serverTimestamp, increment, limit } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Get player wallet balance
 * @param {string} userId - User's Firebase Auth ID
 * @returns {Promise<Object>} Wallet data with balance
 */
export async function getPlayerWallet(userId) {
  try {
    const walletRef = doc(db, 'player_wallets', userId);
    const walletSnap = await getDoc(walletRef);
    
    if (walletSnap.exists()) {
      return { id: walletSnap.id, ...walletSnap.data() };
    }
    
    // Create wallet if doesn't exist
    const newWallet = {
      userId,
      balance: 0,
      currency: 'CAD',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(walletRef, newWallet);
    return newWallet;
  } catch (error) {
    console.error('Error getting wallet:', error);
    throw error;
  }
}

/**
 * Add or deduct money from player wallet
 * @param {string} userId - User's Firebase Auth ID
 * @param {number} amount - Amount to add (positive) or deduct (negative)
 * @param {string} type - Transaction type (e.g., 'balance_added', 'court_fee_deduction', 'refund')
 * @param {string} description - Description of transaction
 * @param {string} adminId - Admin who performed the transaction
 * @returns {Promise<Object>} Updated wallet data
 */
export async function updateWalletBalance(userId, amount, type, description, adminId) {
  try {
    const walletRef = doc(db, 'player_wallets', userId);
    
    // Update wallet balance
    await updateDoc(walletRef, {
      balance: increment(amount),
      updatedAt: serverTimestamp(),
    });
    
    // Record transaction
    await addDoc(collection(db, 'wallet_transactions'), {
      userId,
      amount,
      type,
      description,
      adminId,
      createdAt: serverTimestamp(),
    });
    
    // Get updated wallet
    const updatedWallet = await getPlayerWallet(userId);
    return updatedWallet;
  } catch (error) {
    console.error('Error updating wallet:', error);
    throw error;
  }
}

/**
 * Set wallet balance directly (for initial import)
 * @param {string} userId - User's Firebase Auth ID
 * @param {number} balance - Balance to set
 * @param {string} playerName - Player's name
 * @param {string} email - Player's email
 * @returns {Promise<void>}
 */
export async function setWalletBalance(userId, balance, playerName, email) {
  try {
    const walletRef = doc(db, 'player_wallets', userId);
    await setDoc(walletRef, {
      userId,
      balance: parseFloat(balance),
      currency: 'CAD',
      playerName,
      email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error setting wallet balance:', error);
    throw error;
  }
}

/**
 * Get wallet transactions for a user
 * @param {string} userId - User's Firebase Auth ID
 * @param {number} limit - Number of transactions to fetch
 * @returns {Promise<Array>} Array of transactions
 */
export async function getWalletTransactions(userId, limit = 50) {
  try {
    const q = query(
      collection(db, 'wallet_transactions'),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Sort by date descending
    transactions.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return b.createdAt.seconds - a.createdAt.seconds;
    });
    
    return transactions.slice(0, limit);
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw error;
  }
}

/**
 * Check if player has sufficient balance (CA$ 50 minimum)
 * @param {string} userId - User's Firebase Auth ID
 * @param {number} minimumBalance - Minimum balance required (default 50 CAD)
 * @returns {Promise<boolean>} True if balance is sufficient
 */
export async function hasSufficientBalance(userId, minimumBalance = 50) {
  try {
    const wallet = await getPlayerWallet(userId);
    return wallet.balance >= minimumBalance;
  } catch (error) {
    console.error('Error checking balance:', error);
    return false;
  }
}

/**
 * Get all player wallets (admin only) - with pagination
 * @param {number} limitCount - Maximum number of wallets to fetch (default: 100)
 * @returns {Promise<Array>} Array of all wallets
 */
export async function getAllWallets(limitCount = 100) {
  try {
    const q = query(collection(db, 'player_wallets'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting all wallets:', error);
    throw error;
  }
}
