import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, addDoc, deleteDoc, serverTimestamp, Timestamp, limit } from 'firebase/firestore';
import { db } from './firebase';

// Schedule configuration with +1 guest voting
export const SCHEDULE_CONFIG = {
  wednesday: {
    day: 'Wednesday',
    limit: 36,
    plusOneLimit: 50, // No limit for +1, just tracking
    playTime: { hour: 20, minute: 0 }, // 8 PM
    dayOfWeek: 3,
  },
  thursday: {
    day: 'Thursday',
    limit: 20,
    plusOneLimit: 50,
    playTime: { hour: 20, minute: 0 }, // 8 PM
    dayOfWeek: 4,
  },
  saturday: {
    day: 'Saturday',
    limit: 46,
    plusOneLimit: 50,
    playTime: { hour: 6, minute: 0 }, // 6 AM
    dayOfWeek: 6,
  },
  sunday: {
    day: 'Sunday',
    limit: 22,
    plusOneLimit: 50,
    playTime: { hour: 7, minute: 0 }, // 7 AM
    dayOfWeek: 0,
  },
};

/**
 * Get the Monday 6 PM activation time for the current week
 * @returns {Date} Monday 6 PM of current week
 */
function getCurrentWeekMondayActivation() {
  const now = new Date();
  const monday = new Date(now);
  
  // Get this week's Monday
  const dayOfWeek = now.getDay();
  const daysFromMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(now.getDate() + daysFromMonday);
  monday.setHours(18, 0, 0, 0); // 6 PM
  
  // If we're before Monday 6 PM, get last week's Monday
  if (now < monday) {
    monday.setDate(monday.getDate() - 7);
  }
  
  return monday;
}

/**
 * Check if voting is currently active (after Monday 6 PM of the week)
 * @returns {boolean} True if voting is active
 */
export function isVotingActive() {
  const now = new Date();
  const mondayActivation = getCurrentWeekMondayActivation();
  
  // Voting is active from Monday 6 PM until the next Monday 6 PM
  const nextMondayActivation = new Date(mondayActivation);
  nextMondayActivation.setDate(nextMondayActivation.getDate() + 7);
  
  return now >= mondayActivation && now < nextMondayActivation;
}

/**
 * Get the date for the next occurrence of a specific day in the current voting week
 * @param {number} dayOfWeek - Day of week (0=Sunday, 6=Saturday)
 * @param {Object} time - Time object with hour and minute
 * @returns {Date} Next occurrence date
 */
function getNextDayDate(dayOfWeek, time) {
  const mondayActivation = getCurrentWeekMondayActivation();
  const playDate = new Date(mondayActivation);
  
  // Calculate days from Monday to target day
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday is 6 days from Monday
  playDate.setDate(playDate.getDate() + daysFromMonday);
  playDate.setHours(time.hour, time.minute, 0, 0);
  
  return playDate;
}

/**
 * Check if voting is open for a specific schedule
 * Voting opens Monday 6 PM and closes at 11 AM EST on the event day
 * @param {Date} playDate - Play date/time
 * @param {number} dayOfWeek - Day of week (0=Sunday, 6=Saturday)
 * @returns {Object} Object with isOpen, reason
 */
export function isVotingOpen(playDate, dayOfWeek) {
  const now = new Date();
  const mondayActivation = getCurrentWeekMondayActivation();
  
  // Calculate 11 AM on the event day
  const eventDay = new Date(playDate);
  eventDay.setHours(11, 0, 0, 0);
  
  // Check if before Monday 6 PM
  if (now < mondayActivation) {
    return {
      isOpen: false,
      reason: 'Voting opens Monday at 6:00 PM EST/EDT',
      opensAt: mondayActivation,
    };
  }
  
  // Check if past 11 AM on event day
  if (now >= eventDay) {
    return {
      isOpen: false,
      reason: 'Voting closed at 11:00 AM EST on event day',
      closedAt: eventDay,
    };
  }
  
  return {
    isOpen: true,
    reason: 'Voting is open',
    closesAt: eventDay,
  };
}

/**
 * Check if unvoting is allowed
 * @param {Date} playDate - Play date/time
 * @param {number} dayOfWeek - Day of week
 * @returns {boolean} True if unvoting is allowed
 */
export function canUnvote(playDate, dayOfWeek) {
  const votingStatus = isVotingOpen(playDate, dayOfWeek);
  return votingStatus.isOpen;
}

/**
 * Get or create weekly schedule for a specific day
 * @param {string} scheduleKey - Schedule key (wednesday, thursday, saturday, sunday)
 * @returns {Promise<Object>} Schedule data
 */
export async function getWeeklySchedule(scheduleKey) {
  try {
    const config = SCHEDULE_CONFIG[scheduleKey];
    if (!config) throw new Error('Invalid schedule key');
    
    const playDate = getNextDayDate(config.dayOfWeek, config.playTime);
    const weekId = `${playDate.getFullYear()}-W${Math.ceil(playDate.getDate() / 7)}-${scheduleKey}`;
    
    const scheduleRef = doc(db, 'weekly_schedules', weekId);
    const scheduleSnap = await getDoc(scheduleRef);
    
    if (scheduleSnap.exists()) {
      return { id: scheduleSnap.id, ...scheduleSnap.data() };
    }
    
    // Create new schedule
    const newSchedule = {
      scheduleKey,
      weekId,
      day: config.day,
      playDate: Timestamp.fromDate(playDate),
      limit: config.limit,
      waitlistLimit: config.waitlistLimit,
      currentCount: 0,
      waitlistCount: 0,
      createdAt: serverTimestamp(),
    };
    
    await setDoc(scheduleRef, newSchedule);
    return { id: weekId, ...newSchedule };
  } catch (error) {
    console.error('Error getting schedule:', error);
    throw error;
  }
}

/**
 * Get all votes for a schedule (with limit for performance)
 * @param {string} scheduleId - Schedule ID
 * @param {number} limitCount - Maximum votes to fetch (default: 200)
 * @returns {Promise<Object>} Object with main and plusOne votes
 */
export async function getScheduleVotes(scheduleId, limitCount = 200) {
  try {
    const votesQuery = query(
      collection(db, 'schedule_votes'),
      where('scheduleId', '==', scheduleId),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(votesQuery);
    const allVotes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Separate main and +1 votes
    const mainVotes = allVotes.filter(v => !v.isPlusOne).sort((a, b) => 
      a.votedAt?.seconds - b.votedAt?.seconds
    );
    
    const plusOneVotes = allVotes.filter(v => v.isPlusOne).sort((a, b) => 
      a.votedAt?.seconds - b.votedAt?.seconds
    );
    
    return { mainVotes, plusOneVotes };
  } catch (error) {
    console.error('Error getting votes:', error);
    throw error;
  }
}

/**
 * Vote for a schedule (main or +1)
 * @param {string} scheduleId - Schedule ID
 * @param {string} userId - User ID
 * @param {string} userName - User name
 * @param {string} userEmail - User email
 * @param {boolean} isPlusOne - Whether this is a +1 guest vote
 * @returns {Promise<Object>} Vote data
 */
export async function voteForSchedule(scheduleId, userId, userName, userEmail, isPlusOne = false) {
  try {
    const voteData = {
      scheduleId,
      userId,
      userName,
      userEmail,
      isPlusOne,
      votedAt: serverTimestamp(),
    };
    
    const voteRef = await addDoc(collection(db, 'schedule_votes'), voteData);
    
    // Update schedule count
    const scheduleRef = doc(db, 'weekly_schedules', scheduleId);
    const updateField = isPlusOne ? 'plusOneCount' : 'currentCount';
    const currentDoc = await getDoc(scheduleRef);
    const currentCount = currentDoc.data()[updateField] || 0;
    
    await updateDoc(scheduleRef, {
      [updateField]: currentCount + 1,
    });
    
    return { id: voteRef.id, ...voteData };
  } catch (error) {
    console.error('Error voting:', error);
    throw error;
  }
}

/**
 * Unvote from a schedule with +1 auto-promotion
 * @param {string} scheduleId - Schedule ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result with promotion info if applicable
 */
export async function unvoteFromSchedule(scheduleId, userId) {
  try {
    // Find user's vote
    const votesQuery = query(
      collection(db, 'schedule_votes'),
      where('scheduleId', '==', scheduleId),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(votesQuery);
    if (snapshot.empty) {
      throw new Error('Vote not found');
    }
    
    const voteDoc = snapshot.docs[0];
    const voteData = voteDoc.data();
    const wasPlusOne = voteData.isPlusOne;
    
    // Delete vote
    await deleteDoc(voteDoc.ref);
    
    // Update schedule count
    const scheduleRef = doc(db, 'weekly_schedules', scheduleId);
    const scheduleDoc = await getDoc(scheduleRef);
    const updateField = wasPlusOne ? 'plusOneCount' : 'currentCount';
    const currentCount = scheduleDoc.data()[updateField] || 0;
    
    await updateDoc(scheduleRef, {
      [updateField]: Math.max(0, currentCount - 1),
    });
    
    let promotedPlayer = null;
    
    // If main vote was removed, promote from +1
    if (!wasPlusOne) {
      const { plusOneVotes } = await getScheduleVotes(scheduleId);
      
      if (plusOneVotes.length > 0) {
        // Promote first person from +1
        const firstPlusOne = plusOneVotes[0];
        const plusOneVoteRef = doc(db, 'schedule_votes', firstPlusOne.id);
        
        // Update vote to main
        await updateDoc(plusOneVoteRef, {
          isPlusOne: false,
          promotedAt: serverTimestamp(),
        });
        
        // Update counts
        const scheduleData = scheduleDoc.data();
        await updateDoc(scheduleRef, {
          currentCount: (scheduleData.currentCount || 0) + 1,
          plusOneCount: Math.max(0, (scheduleData.plusOneCount || 0) - 1),
        });
        
        promotedPlayer = firstPlusOne;
      }
    }
    
    return {
      success: true,
      wasPlusOne,
      promotedPlayer,
    };
  } catch (error) {
    console.error('Error unvoting:', error);
    throw error;
  }
}

/**
 * Check if user has voted for a schedule
 * @param {string} scheduleId - Schedule ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Vote data if exists, null otherwise
 */
export async function getUserVote(scheduleId, userId) {
  try {
    const votesQuery = query(
      collection(db, 'schedule_votes'),
      where('scheduleId', '==', scheduleId),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(votesQuery);
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error('Error checking vote:', error);
    return null;
  }
}
