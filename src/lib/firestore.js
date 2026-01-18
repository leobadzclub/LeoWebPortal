import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db } from './firebase';

// Users
export const getUser = async (uid) => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const getAllUsers = async (limitCount = 100) => {
  const q = query(collection(db, 'users'), limit(limitCount));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateUser = async (uid, data) => {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

// Leaderboard
export const getLeaderboard = async (limitCount = 100) => {
  const q = query(collection(db, 'leaderboard'), orderBy('rating', 'desc'), limit(limitCount));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateLeaderboard = async (uid, data) => {
  const docRef = doc(db, 'leaderboard', uid);
  await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
};

// Matches
export const createMatch = async (matchData) => {
  const docRef = await addDoc(collection(db, 'matches'), {
    ...matchData,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const getMatches = async (limitCount = 50) => {
  const q = query(collection(db, 'matches'), orderBy('createdAt', 'desc'), limit(limitCount));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Tournaments
export const getTournaments = async (limitCount = 20) => {
  const q = query(collection(db, 'tournaments'), orderBy('date', 'desc'), limit(limitCount));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createTournament = async (tournamentData) => {
  const docRef = await addDoc(collection(db, 'tournaments'), {
    ...tournamentData,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateTournament = async (id, data) => {
  const docRef = doc(db, 'tournaments', id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

export const deleteTournament = async (id) => {
  await deleteDoc(doc(db, 'tournaments', id));
};

// Schedules
export const getSchedules = async (limitCount = 30) => {
  const q = query(collection(db, 'schedules'), orderBy('date', 'asc'), limit(limitCount));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createSchedule = async (scheduleData) => {
  const docRef = await addDoc(collection(db, 'schedules'), {
    ...scheduleData,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateSchedule = async (id, data) => {
  const docRef = doc(db, 'schedules', id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

export const deleteSchedule = async (id) => {
  await deleteDoc(doc(db, 'schedules', id));
};

// Registrations
export const createRegistration = async (scheduleId, userId, userName) => {
  const docRef = await addDoc(collection(db, 'registrations'), {
    scheduleId,
    userId,
    userName,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const getRegistrations = async (scheduleId) => {
  const q = query(
    collection(db, 'registrations'), 
    where('scheduleId', '==', scheduleId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Payments
export const getPayments = async (limitCount = 100) => {
  const q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'), limit(limitCount));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createPayment = async (paymentData) => {
  const docRef = await addDoc(collection(db, 'payments'), {
    ...paymentData,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

// Community Posts
export const getCommunityPosts = async (limitCount = 50) => {
  const q = query(collection(db, 'community_posts'), orderBy('createdAt', 'desc'), limit(limitCount));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createCommunityPost = async (postData) => {
  const docRef = await addDoc(collection(db, 'community_posts'), {
    ...postData,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const deleteCommunityPost = async (id) => {
  await deleteDoc(doc(db, 'community_posts', id));
};