// TrueSkill Leaderboard Player Data
export const LEADERBOARD_PLAYERS = [
  { name: 'Tanmai', matches: 7, wins: 4, pf: 142, pa: 121, mu: 36.07, sigma: 4.31 },
  { name: 'Nagendra', matches: 8, wins: 6, pf: 159, pa: 152, mu: 34.98, sigma: 4.73 },
  { name: 'Sathish', matches: 8, wins: 5, pf: 150, pa: 147, mu: 34.82, sigma: 4.51 },
  { name: 'Madhu', matches: 5, wins: 2, pf: 85, pa: 95, mu: 33.41, sigma: 4.71 },
  { name: 'Poovarasan', matches: 8, wins: 5, pf: 153, pa: 137, mu: 31.88, sigma: 4.38 },
  { name: 'Arun Palanivel', matches: 3, wins: 1, pf: 49, pa: 58, mu: 31.50, sigma: 5.00 },
  { name: 'Rex', matches: 7, wins: 3, pf: 126, pa: 132, mu: 30.48, sigma: 4.58 },
  { name: 'Sridhar', matches: 1, wins: 1, pf: 21, pa: 19, mu: 30.13, sigma: 7.43 },
  { name: 'Senthil', matches: 1, wins: 1, pf: 21, pa: 19, mu: 30.13, sigma: 7.43 },
  { name: 'Harshil', matches: 6, wins: 3, pf: 121, pa: 119, mu: 29.60, sigma: 5.45 },
  { name: 'Arun Kalaivanan', matches: 3, wins: 1, pf: 58, pa: 64, mu: 27.28, sigma: 5.92 },
  { name: 'Muhil', matches: 1, wins: 0, pf: 22, pa: 24, mu: 23.87, sigma: 7.29 },
  { name: 'Srinath', matches: 2, wins: 0, pf: 32, pa: 42, mu: 21.81, sigma: 6.85 },
  { name: 'Gowtham', matches: 4, wins: 0, pf: 75, pa: 85, mu: 18.35, sigma: 6.18 },
];

export const WEEK1_MATCHES = [
  { team1: ['Tanmai', 'Rex'], team2: ['Poovarasan', 'Madhu'], score: '21-14', winner: 1 },
  { team1: ['Poovarasan', 'Nagendra'], team2: ['Rex', 'Harshil'], score: '21-17', winner: 1 },
  { team1: ['Gowtham', 'Arun Kalaivanan'], team2: ['Senthil', 'Sridhar'], score: '19-21', winner: 2 },
  { team1: ['Sathish', 'Madhu'], team2: ['Tanmai', 'Srinath'], score: '21-19', winner: 1 },
  { team1: ['Sathish', 'Rex'], team2: ['Tanmai', 'Poovarasan'], score: '21-19', winner: 1 },
  { team1: ['Poovarasan', 'Nagendra'], team2: ['Rex', 'Arun Kalaivanan'], score: '21-15', winner: 1 },
  { team1: ['Tanmai', 'Arun Palanivel'], team2: ['Rex', 'Madhu'], score: '21-16', winner: 1 },
  { team1: ['Sathish', 'Poovarasan'], team2: ['Arun Palanivel', 'Rex'], score: '21-15', winner: 1 },
  { team1: ['Sathish', 'Arun Palanivel'], team2: ['Madhu', 'Poovarasan'], score: '13-21', winner: 2 },
  { team1: ['Harshil', 'Rex'], team2: ['Poovarasan', 'Nagendra'], score: '21-15', winner: 1 },
  { team1: ['Nagendra', 'Sathish'], team2: ['Gowtham', 'Harshil'], score: '21-18', winner: 1 },
  { team1: ['Sathish', 'Nagendra'], team2: ['Tanmai', 'Poovarasan'], score: '14-21', winner: 2 },
  { team1: ['Tanmai', 'Gowtham'], team2: ['Nagendra', 'Harshil'], score: '20-22', winner: 2 },
  { team1: ['Harshil', 'Muhil'], team2: ['Nagendra', 'Arun Kalaivanan'], score: '22-24', winner: 2 },
  { team1: ['Sathish', 'Tanmai'], team2: ['Madhu', 'Srinath'], score: '21-13', winner: 1 },
  { team1: ['Sathish', 'Gowtham'], team2: ['Nagendra', 'Harshil'], score: '18-21', winner: 2 },
];

// Calculate derived stats
export function calculatePlayerStats(playerName) {
  const player = LEADERBOARD_PLAYERS.find(p => p.name === playerName);
  if (!player) return null;

  const winRate = player.matches > 0 ? (player.wins / player.matches * 100).toFixed(1) : 0;
  const avgPF = player.matches > 0 ? (player.pf / player.matches).toFixed(1) : 0;
  const avgPA = player.matches > 0 ? (player.pa / player.matches).toFixed(1) : 0;
  const conservativeScore = player.mu - (3 * player.sigma);
  const pointDiff = player.pf - player.pa;

  return {
    ...player,
    winRate,
    avgPF,
    avgPA,
    conservativeScore,
    pointDiff,
  };
}

// Get top performers in various categories
export function getTopPerformers() {
  const players = LEADERBOARD_PLAYERS.map(p => calculatePlayerStats(p.name));

  return {
    mostMatches: players.sort((a, b) => b.matches - a.matches).slice(0, 3),
    bestWinRate: players.filter(p => p.matches >= 3).sort((a, b) => b.winRate - a.winRate).slice(0, 3),
    mostPointsScored: players.sort((a, b) => b.pf - a.pf).slice(0, 3),
    leastPointsAgainst: players.filter(p => p.matches >= 3).sort((a, b) => a.pa - b.pa).slice(0, 3),
    highestRating: players.sort((a, b) => b.mu - a.mu).slice(0, 3),
    mostConfident: players.sort((a, b) => a.sigma - b.sigma).slice(0, 3),
    biggestPointDiff: players.filter(p => p.matches >= 3).sort((a, b) => b.pointDiff - a.pointDiff).slice(0, 3),
    bestAvgScore: players.filter(p => p.matches >= 3).sort((a, b) => b.avgPF - a.avgPF).slice(0, 3),
  };
}
