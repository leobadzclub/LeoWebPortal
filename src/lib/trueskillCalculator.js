/**
 * Lightweight TrueSkill-inspired rating calculator for doubles badminton
 */

class Player {
  constructor(name, mu = 25, sigma = 8.33) {
    this.name = name;
    this.mu = mu;
    this.sigma = sigma;
    this.matches = 0;
    this.wins = 0;
    this.pf = 0;
    this.pa = 0;
  }

  get conservativeRating() {
    return this.mu - 3 * this.sigma;
  }
}

/**
 * Calculate expected win probability for team
 */
function getWinProbability(team1Mu, team1Sigma, team2Mu, team2Sigma) {
  const deltaMu = team1Mu - team2Mu;
  const sumSigma = Math.sqrt(team1Sigma * team1Sigma + team2Sigma * team2Sigma);
  const denom = Math.sqrt(2 * sumSigma * sumSigma + 50 * 50);
  return 1 / (1 + Math.exp(-deltaMu / denom));
}

/**
 * Update player ratings after match
 */
function updateRatings(winner, loser, actualMargin) {
  const K = 32; // Learning rate
  const marginFactor = Math.min(actualMargin / 10, 2); // Cap at 2x impact
  
  // Calculate team strengths
  const winnerStrength = winner.mu;
  const loserStrength = loser.mu;
  
  // Expected probability
  const expectedWin = getWinProbability(
    winnerStrength,
    winner.sigma,
    loserStrength,
    loser.sigma
  );
  
  // Rating change based on expectation
  const ratingChange = K * (1 - expectedWin) * marginFactor;
  
  // Update mu
  winner.mu += ratingChange;
  loser.mu -= ratingChange;
  
  // Update sigma (decrease with more games, minimum 4)
  winner.sigma = Math.max(4, winner.sigma * 0.95);
  loser.sigma = Math.max(4, loser.sigma * 0.95);
}

/**
 * Parse match results CSV and calculate all stats
 */
export function calculateFromMatchResults(csvText) {
  const rows = csvText.split('\n').filter(row => row.trim());
  
  if (rows.length < 2) {
    throw new Error('CSV must have at least header and one match');
  }
  
  // Parse matches
  const matches = rows.slice(1).map(row => {
    const [team1Str, team2Str, scoreStr] = row.split(',').map(s => s.trim());
    
    if (!team1Str || !team2Str || !scoreStr) {
      throw new Error(`Invalid row format: ${row}`);
    }
    
    // Parse team players
    const team1Players = team1Str.split('/').map(p => p.trim()).filter(p => p);
    const team2Players = team2Str.split('/').map(p => p.trim()).filter(p => p);
    
    if (team1Players.length !== 2 || team2Players.length !== 2) {
      throw new Error(`Each team must have exactly 2 players: ${team1Str} vs ${team2Str}`);
    }
    
    // Parse score
    const [score1Str, score2Str] = scoreStr.split('-').map(s => s.trim());
    const score1 = parseInt(score1Str);
    const score2 = parseInt(score2Str);
    
    if (isNaN(score1) || isNaN(score2)) {
      throw new Error(`Invalid score format: ${scoreStr}`);
    }
    
    return {
      team1: team1Players,
      team2: team2Players,
      score1,
      score2,
      winner: score1 > score2 ? 1 : 2,
      margin: Math.abs(score1 - score2),
    };
  });

  // Initialize all players
  const players = new Map();
  
  matches.forEach(match => {
    [...match.team1, ...match.team2].forEach(playerName => {
      if (!players.has(playerName)) {
        players.set(playerName, new Player(playerName));
      }
    });
  });

  // Process each match
  matches.forEach(match => {
    const team1 = match.team1.map(name => players.get(name));
    const team2 = match.team2.map(name => players.get(name));
    
    // Calculate team average ratings
    const team1AvgMu = (team1[0].mu + team1[1].mu) / 2;
    const team1AvgSigma = Math.sqrt((team1[0].sigma ** 2 + team1[1].sigma ** 2) / 2);
    const team2AvgMu = (team2[0].mu + team2[1].mu) / 2;
    const team2AvgSigma = Math.sqrt((team2[0].sigma ** 2 + team2[1].sigma ** 2) / 2);
    
    // Create virtual team players for rating update
    const virtualTeam1 = new Player('team1', team1AvgMu, team1AvgSigma);
    const virtualTeam2 = new Player('team2', team2AvgMu, team2AvgSigma);
    
    // Update ratings
    if (match.winner === 1) {
      updateRatings(virtualTeam1, virtualTeam2, match.margin);
    } else {
      updateRatings(virtualTeam2, virtualTeam1, match.margin);
    }
    
    // Apply changes to actual players
    const muChange1 = virtualTeam1.mu - team1AvgMu;
    const muChange2 = virtualTeam2.mu - team2AvgMu;
    const sigmaChange = virtualTeam1.sigma / team1AvgSigma;
    
    team1.forEach(p => {
      p.mu += muChange1;
      p.sigma *= sigmaChange;
      p.matches++;
      p.pf += match.score1;
      p.pa += match.score2;
      if (match.winner === 1) p.wins++;
    });
    
    team2.forEach(p => {
      p.mu += muChange2;
      p.sigma *= sigmaChange;
      p.matches++;
      p.pf += match.score2;
      p.pa += match.score1;
      if (match.winner === 2) p.wins++;
    });
  });

  // Convert to array and add calculated stats
  const playerStats = Array.from(players.values()).map(p => ({
    name: p.name,
    matches: p.matches,
    wins: p.wins,
    pf: p.pf,
    pa: p.pa,
    mu: p.mu,
    sigma: p.sigma,
    conservativeScore: p.conservativeRating,
    winRate: p.matches > 0 ? ((p.wins / p.matches) * 100).toFixed(1) : 0,
    avgPF: p.matches > 0 ? (p.pf / p.matches).toFixed(1) : 0,
    avgPA: p.matches > 0 ? (p.pa / p.matches).toFixed(1) : 0,
    pointDiff: p.pf - p.pa,
  }));

  playerStats.sort((a, b) => b.conservativeScore - a.conservativeScore);

  return {
    players: playerStats,
    matches,
    totalPlayers: playerStats.length,
    totalMatches: matches.length,
  };
}

/**
 * Parse pre-calculated player data
 */
export function parsePlayerCSV(csvText) {
  const rows = csvText.split('\n').filter(row => row.trim());
  
  const players = rows.slice(1).map(row => {
    const [name, matches, wins, pf, pa, mu, sigma] = row.split(',').map(s => s.trim());
    
    const matchesNum = parseInt(matches) || 0;
    const winsNum = parseInt(wins) || 0;
    const pfNum = parseInt(pf) || 0;
    const paNum = parseInt(pa) || 0;
    const muNum = parseFloat(mu) || 25;
    const sigmaNum = parseFloat(sigma) || 8.33;
    
    return {
      name,
      matches: matchesNum,
      wins: winsNum,
      pf: pfNum,
      pa: paNum,
      mu: muNum,
      sigma: sigmaNum,
      conservativeScore: muNum - (3 * sigmaNum),
      winRate: matchesNum > 0 ? (winsNum / matchesNum * 100).toFixed(1) : 0,
      avgPF: matchesNum > 0 ? (pfNum / matchesNum).toFixed(1) : 0,
      avgPA: matchesNum > 0 ? (paNum / matchesNum).toFixed(1) : 0,
      pointDiff: pfNum - paNum,
    };
  }).filter(p => p.name);

  players.sort((a, b) => b.conservativeScore - a.conservativeScore);

  return {
    players,
    totalPlayers: players.length,
  };
}

export function getTopPerformersFromPlayers(players) {
  return {
    mostMatches: [...players].sort((a, b) => b.matches - a.matches).slice(0, 3),
    bestWinRate: [...players].filter(p => p.matches >= 3).sort((a, b) => b.winRate - a.winRate).slice(0, 3),
    mostPointsScored: [...players].sort((a, b) => b.pf - a.pf).slice(0, 3),
    leastPointsAgainst: [...players].filter(p => p.matches >= 3).sort((a, b) => a.pa - b.pa).slice(0, 3),
    highestRating: [...players].sort((a, b) => b.mu - a.mu).slice(0, 3),
    mostConfident: [...players].sort((a, b) => a.sigma - b.sigma).slice(0, 3),
    biggestPointDiff: [...players].filter(p => p.matches >= 3).sort((a, b) => b.pointDiff - a.pointDiff).slice(0, 3),
    bestAvgScore: [...players].filter(p => p.matches >= 3).sort((a, b) => b.avgPF - a.avgPF).slice(0, 3),
  };
}
