// TrueSkill implementation placeholder
// Using simplified Elo-like rating system for MVP
// Can be replaced with ts-trueskill package later

const K_FACTOR = 32;
const DEFAULT_RATING = 1500;

export function calculateNewRatings(winner1Rating, winner2Rating, loser1Rating, loser2Rating) {
  // Average team ratings
  const winnerAvg = (winner1Rating + winner2Rating) / 2;
  const loserAvg = (loser1Rating + loser2Rating) / 2;
  
  // Expected scores
  const winnerExpected = 1 / (1 + Math.pow(10, (loserAvg - winnerAvg) / 400));
  const loserExpected = 1 - winnerExpected;
  
  // Calculate rating changes
  const winnerChange = K_FACTOR * (1 - winnerExpected);
  const loserChange = K_FACTOR * (0 - loserExpected);
  
  return {
    winner1: Math.round(winner1Rating + winnerChange),
    winner2: Math.round(winner2Rating + winnerChange),
    loser1: Math.round(loser1Rating + loserChange),
    loser2: Math.round(loser2Rating + loserChange)
  };
}

export function getDefaultRating() {
  return DEFAULT_RATING;
}

export function calculateExpectedScore(rating1, rating2) {
  return 1 / (1 + Math.pow(10, (rating2 - rating1) / 400));
}