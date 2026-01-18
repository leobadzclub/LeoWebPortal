import { collection, doc, getDoc, setDoc, getDocs, query, orderBy, where, limit } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Save weekly leaderboard data to Firestore
 * @param {number} weekNumber - Week number
 * @param {Array} players - Player data with ratings
 * @param {Array} matches - Match results
 * @param {Array} promotions - List of promoted players
 */
export async function saveWeeklyLeaderboard(weekNumber, players, matches, promotions = []) {
  try {
    const weekId = `week_${weekNumber}`;
    
    // Save week summary
    await setDoc(doc(db, 'leaderboard_weeks', weekId), {
      weekNumber,
      totalPlayers: players.length,
      totalMatches: matches.length,
      promotions,
      createdAt: new Date(),
    });

    // Save each player's week data
    for (const player of players) {
      await setDoc(doc(db, 'leaderboard_players', `${weekId}_${player.name}`), {
        weekNumber,
        playerName: player.name,
        mu: player.mu,
        sigma: player.sigma,
        matches: player.matches,
        wins: player.wins,
        pf: player.pf,
        pa: player.pa,
        conservativeScore: player.conservativeScore,
        winRate: player.winRate,
        rank: players.indexOf(player) + 1,
        skillLevel: player.skillLevel || 'INT',
        createdAt: new Date(),
      });
    }

    // Save match results
    for (const match of matches) {
      await setDoc(doc(db, 'leaderboard_matches', `${weekId}_match_${match.matchId}`), {
        weekNumber,
        ...match,
        createdAt: new Date(),
      });
    }

    return { success: true, weekId };
  } catch (error) {
    console.error('Error saving weekly leaderboard:', error);
    throw error;
  }
}

/**
 * Get previous week's final ratings
 * @param {number} weekNumber - Current week number
 * @returns {Promise<Map>} Map of player names to their final ratings
 */
export async function getPreviousWeekRatings(weekNumber) {
  try {
    const previousWeek = weekNumber - 1;
    if (previousWeek < 1) return null;

    const weekId = `week_${previousWeek}`;
    const q = query(
      collection(db, 'leaderboard_players'),
      where('weekNumber', '==', previousWeek),
      limit(200)
    );
    
    const snapshot = await getDocs(q);
    const ratingsMap = new Map();
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      ratingsMap.set(data.playerName, {
        mu: data.mu,
        sigma: data.sigma,
        skillLevel: data.skillLevel,
      });
    });

    return ratingsMap;
  } catch (error) {
    console.error('Error getting previous week ratings:', error);
    return null;
  }
}

/**
 * Get all weeks
 */
export async function getAllWeeks() {
  try {
    const q = query(
      collection(db, 'leaderboard_weeks'),
      orderBy('weekNumber', 'desc'),
      limit(52)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting weeks:', error);
    return [];
  }
}

/**
 * Get specific week's leaderboard
 */
export async function getWeekLeaderboard(weekNumber) {
  try {
    const q = query(
      collection(db, 'leaderboard_players'),
      where('weekNumber', '==', weekNumber),
      limit(200)
    );
    
    const snapshot = await getDocs(q);
    const players = snapshot.docs.map(doc => doc.data());
    players.sort((a, b) => a.rank - b.rank);
    
    return players;
  } catch (error) {
    console.error('Error getting week leaderboard:', error);
    return [];
  }
}

/**
 * Determine skill level promotions
 * @param {Array} players - Sorted players
 * @returns {Array} List of promotions
 */
export function determinePromotions(players) {
  const promotions = [];
  const top5 = players.slice(0, 5);

  const skillLevelOrder = ['INT', 'INT_PLUS', 'ADV', 'ADV_PLUS'];

  top5.forEach(player => {
    const currentLevel = player.skillLevel || 'INT';
    const currentIndex = skillLevelOrder.indexOf(currentLevel);
    
    if (currentIndex < skillLevelOrder.length - 1) {
      const newLevel = skillLevelOrder[currentIndex + 1];
      promotions.push({
        playerName: player.name,
        fromLevel: currentLevel,
        toLevel: newLevel,
        rating: player.conservativeScore.toFixed(2),
      });
    }
  });

  return promotions;
}
