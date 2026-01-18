'use client';

import { useState } from 'react';
import { useAuth } from '@/src/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, FileText, Calculator, CheckCircle, Users, Trophy, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BackButton from '@/src/components/BackButton';
import { saveWeeklyLeaderboard, getPreviousWeekRatings, determinePromotions } from '@/src/lib/leaderboardStorage';

export default function UploadLeaderboardPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  
  // Initial Players state
  const [initialPlayersFile, setInitialPlayersFile] = useState(null);
  const [initialPlayersData, setInitialPlayersData] = useState([]);
  const [initialPlayersPreview, setInitialPlayersPreview] = useState(null);
  
  // Weekly Results state
  const [weeklyResultsFile, setWeeklyResultsFile] = useState(null);
  const [weeklyResultsData, setWeeklyResultsData] = useState('');
  const [weeklyResultsPreview, setWeeklyResultsPreview] = useState(null);
  
  const [calculating, setCalculating] = useState(false);
  const [calculatedData, setCalculatedData] = useState(null);
  const [weekNumber, setWeekNumber] = useState(1);
  const [promotions, setPromotions] = useState([]);
  
  const isAdmin = userProfile?.role === 'admin';

  // Handle Initial Players CSV upload
  const handleInitialPlayersUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setInitialPlayersFile(file);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split('\n').filter(row => row.trim());
      
      // Parse: name,level,mu,sigma,matches_played,wins,points_for,points_against
      const players = rows.slice(1).map(row => {
        const [name, level, mu, sigma, matches, wins, pf, pa] = row.split(',').map(s => s.trim());
        return {
          name,
          level,
          mu: parseFloat(mu) || 25,
          sigma: parseFloat(sigma) || 8.33,
          matches: parseInt(matches) || 0,
          wins: parseInt(wins) || 0,
          pf: parseInt(pf) || 0,
          pa: parseInt(pa) || 0,
        };
      }).filter(p => p.name);
      
      setInitialPlayersData(players);
      setInitialPlayersPreview({ headers: rows[0].split(','), data: rows.slice(1, 6).map(r => r.split(',')) });
      toast.success(`✅ Loaded ${players.length} players with base points`);
    };
    reader.readAsText(file);
  };

  // Handle Weekly Results CSV upload
  const handleWeeklyResultsUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setWeeklyResultsFile(file);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setWeeklyResultsData(text);
      
      const rows = text.split('\n').filter(row => row.trim());
      const headers = rows[0].split(',');
      const data = rows.slice(1, 6).map(row => row.split(','));
      
      setWeeklyResultsPreview({ headers, data, totalRows: rows.length - 1 });
      toast.success(`✅ Loaded ${rows.length - 1} match results`);
    };
    reader.readAsText(file);
  };

  // Calculate Leaderboard from both files
  const handleCalculate = async () => {
    if (initialPlayersData.length === 0) {
      toast.error('Please upload Initial Players CSV first');
      return;
    }

    if (!weeklyResultsData) {
      toast.error('Please upload Weekly Results CSV');
      return;
    }

    setCalculating(true);
    try {
      // Get previous week ratings if not week 1
      const previousRatings = await getPreviousWeekRatings(weekNumber);
      
      // Parse weekly results
      const rows = weeklyResultsData.split('\n').filter(row => row.trim());
      const matches = rows.slice(1).map(row => {
        const [week, matchId, p1, p2, p3, p4, s1, s2] = row.split(',').map(s => s.trim());
        return {
          week,
          matchId,
          team1: [p1, p2],
          team2: [p3, p4],
          team1Score: parseInt(s1),
          team2Score: parseInt(s2),
          winner: parseInt(s1) > parseInt(s2) ? 1 : 2,
        };
      });

      // Initialize player ratings
      const playerRatings = new Map();
      
      initialPlayersData.forEach(p => {
        const prevRating = previousRatings?.get(p.name);
        
        playerRatings.set(p.name, {
          mu: prevRating?.mu || p.mu,
          sigma: prevRating?.sigma || p.sigma,
          skillLevel: prevRating?.skillLevel || p.level,
          matches: 0,
          wins: 0,
          pf: 0,
          pa: 0,
        });
      });

      // Process each match
      matches.forEach(match => {
        [match.team1[0], match.team1[1], match.team2[0], match.team2[1]].forEach(playerName => {
          if (playerName && !playerRatings.has(playerName)) {
            playerRatings.set(playerName, {
              mu: 25,
              sigma: 8.33,
              skillLevel: 'INT',
              matches: 0,
              wins: 0,
              pf: 0,
              pa: 0,
            });
          }
        });

        // Update stats
        match.team1.forEach(p => {
          if (p && playerRatings.has(p)) {
            const stats = playerRatings.get(p);
            stats.matches++;
            stats.pf += match.team1Score;
            stats.pa += match.team2Score;
            if (match.winner === 1) stats.wins++;
          }
        });

        match.team2.forEach(p => {
          if (p && playerRatings.has(p)) {
            const stats = playerRatings.get(p);
            stats.matches++;
            stats.pf += match.team2Score;
            stats.pa += match.team1Score;
            if (match.winner === 2) stats.wins++;
          }
        });

        // Rating update
        const margin = Math.abs(match.team1Score - match.team2Score);
        const ratingChange = margin * 0.3;
        
        if (match.winner === 1) {
          match.team1.forEach(p => {
            if (p && playerRatings.has(p)) {
              playerRatings.get(p).mu += ratingChange;
              playerRatings.get(p).sigma = Math.max(4, playerRatings.get(p).sigma * 0.95);
            }
          });
          match.team2.forEach(p => {
            if (p && playerRatings.has(p)) {
              playerRatings.get(p).mu -= ratingChange * 0.5;
              playerRatings.get(p).sigma = Math.max(4, playerRatings.get(p).sigma * 0.95);
            }
          });
        } else {
          match.team2.forEach(p => {
            if (p && playerRatings.has(p)) {
              playerRatings.get(p).mu += ratingChange;
              playerRatings.get(p).sigma = Math.max(4, playerRatings.get(p).sigma * 0.95);
            }
          });
          match.team1.forEach(p => {
            if (p && playerRatings.has(p)) {
              playerRatings.get(p).mu -= ratingChange * 0.5;
              playerRatings.get(p).sigma = Math.max(4, playerRatings.get(p).sigma * 0.95);
            }
          });
        }
      });

      // Convert to array
      const players = Array.from(playerRatings.entries()).map(([name, data]) => ({
        name,
        mu: data.mu,
        sigma: data.sigma,
        skillLevel: data.skillLevel,
        matches: data.matches,
        wins: data.wins,
        pf: data.pf,
        pa: data.pa,
        conservativeScore: data.mu - (3 * data.sigma),
        winRate: data.matches > 0 ? ((data.wins / data.matches) * 100).toFixed(1) : 0,
        avgPF: data.matches > 0 ? (data.pf / data.matches).toFixed(1) : 0,
        avgPA: data.matches > 0 ? (data.pa / data.matches).toFixed(1) : 0,
        pointDiff: data.pf - data.pa,
      }));

      players.sort((a, b) => b.conservativeScore - a.conservativeScore);

      // Determine promotions
      const weekPromotions = determinePromotions(players);
      setPromotions(weekPromotions);

      const result = {
        players,
        matches,
        totalPlayers: players.length,
        totalMatches: matches.length,
        weekNumber,
        promotions: weekPromotions,
      };

      // Save to Firestore
      await saveWeeklyLeaderboard(weekNumber, players, matches, weekPromotions);

      setCalculatedData(result);
      localStorage.setItem('leaderboard_calculated', JSON.stringify(result));
      localStorage.setItem('current_week', weekNumber.toString());
      
      toast.success(`✅ Week ${weekNumber} calculated! ${result.totalPlayers} players, ${weekPromotions.length} promotions!`);
    } catch (error) {
      console.error('Calculation error:', error);
      toast.error(`Calculation failed: ${error.message}`);
    } finally {
      setCalculating(false);
    }
  };

  const handleSaveAndView = () => {
    if (!calculatedData) {
      toast.error('Please calculate leaderboard first');
      return;
    }
    
    toast.success('Leaderboard saved! Redirecting...');
    setTimeout(() => {
      router.push('/leaderboard');
    }, 1000);
  };

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4 text-white">Access Denied</h1>
        <p className="text-gray-400 mb-8">Admin privileges required</p>
        <Link href="/">
          <Button className="bg-yellow-400 hover:bg-yellow-500 text-navy-900">Go to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 font-montserrat">
              <span className="text-yellow-400">Leaderboard</span> Upload
            </h1>
            <p className="text-gray-400">Upload player base points and weekly match results</p>
          </div>

          {/* Week Number Input */}
          <Card className="bg-purple-900/20 border-purple-700">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <Label htmlFor="weekNumber" className="text-white">Week Number:</Label>
                <Input
                  id="weekNumber"
                  type="number"
                  min="1"
                  value={weekNumber}
                  onChange={(e) => setWeekNumber(parseInt(e.target.value) || 1)}
                  className="w-24 bg-gray-800 border-gray-700 text-white"
                />
                <p className="text-gray-400 text-sm">
                  {weekNumber === 1 ? 'Uses base points' : `Uses Week ${weekNumber - 1} final ratings`}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-400" />
                <div>
                  <CardTitle className="text-white text-2xl">Step 1: Upload Initial Players</CardTitle>
                  <CardDescription className="text-gray-400">
                    Upload player names with skill levels and base points (one-time setup)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <p className="text-blue-400 text-sm font-semibold mb-2">CSV Format:</p>
                <code className="text-xs text-gray-300 block bg-gray-800 p-3 rounded">
                  name,level,mu,sigma,matches_played,wins,points_for,points_against
                  <br />
                  Madhu,ADV,33,6,0,0,0,0
                  <br />
                  Poovarasan,ADV,33,6,0,0,0,0
                </code>
              </div>

              <Input
                type="file"
                accept=".csv"
                onChange={handleInitialPlayersUpload}
                className="bg-gray-800 border-gray-700 text-white cursor-pointer"
              />

              {initialPlayersPreview && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-400" />
                    Preview (First 5 of {initialPlayersData.length} players)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-700">
                          {initialPlayersPreview.headers.map((h, i) => (
                            <th key={i} className="text-left text-gray-400 p-2">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {initialPlayersPreview.data.map((row, i) => (
                          <tr key={i} className="border-b border-gray-700">
                            {row.map((cell, j) => (
                              <td key={j} className="text-gray-300 p-2">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-green-400 text-sm mt-3">
                    ✅ {initialPlayersData.length} players loaded with base points
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Weekly Results Upload */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-green-400" />
                <div>
                  <CardTitle className="text-white text-2xl">Step 2: Upload Weekly Results</CardTitle>
                  <CardDescription className="text-gray-400">
                    Upload match results from the week (Team 1 vs Team 2 format)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                <p className="text-green-400 text-sm font-semibold mb-2">CSV Format:</p>
                <code className="text-xs text-gray-300 block bg-gray-800 p-3 rounded">
                  week,matchId,player1,player2,player3,player4,team1Score,team2Score
                  <br />
                  1,1,Sridhar,Rajesh Reddy,Arun K,Srinath,17,21
                  <br />
                  1,2,Goutham,Poovarasan,Sathish,Rex,17,21
                </code>
                <p className="text-xs text-gray-400 mt-2">
                  Team 1: player1 + player2 | Team 2: player3 + player4
                </p>
              </div>

              <Input
                type="file"
                accept=".csv"
                onChange={handleWeeklyResultsUpload}
                className="bg-gray-800 border-gray-700 text-white cursor-pointer"
              />

              {weeklyResultsPreview && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-400" />
                    Preview (First 5 of {weeklyResultsPreview.totalRows} matches)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-700">
                          {weeklyResultsPreview.headers.map((h, i) => (
                            <th key={i} className="text-left text-gray-400 p-2">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {weeklyResultsPreview.data.map((row, i) => (
                          <tr key={i} className="border-b border-gray-700">
                            {row.map((cell, j) => (
                              <td key={j} className="text-gray-300 p-2">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-green-400 text-sm mt-3">
                    ✅ {weeklyResultsPreview.totalRows} matches loaded
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Calculate Button */}
          {initialPlayersData.length > 0 && weeklyResultsData && !calculatedData && (
            <Button
              onClick={handleCalculate}
              disabled={calculating}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-navy-900 font-semibold h-14 text-lg"
            >
              {calculating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-navy-900 border-t-transparent mr-2"></div>
                  Calculating Leaderboard...
                </>
              ) : (
                <>
                  <Calculator className="h-5 w-5 mr-2" />
                  Calculate Leaderboard
                </>
              )}
            </Button>
          )}

          {/* Results */}
          {calculatedData && (
            <Card className="bg-green-900/20 border-green-700">
              <CardContent className="py-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                  <div>
                    <h3 className="text-white font-bold text-lg">Calculation Complete!</h3>
                    <p className="text-green-400 text-sm">TrueSkill ratings updated from base points</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div className="bg-gray-800 p-3 rounded">
                    <p className="text-gray-400">Total Players</p>
                    <p className="text-white font-bold text-xl">{calculatedData.totalPlayers}</p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded">
                    <p className="text-gray-400">Total Matches</p>
                    <p className="text-white font-bold text-xl">{calculatedData.totalMatches}</p>
                  </div>
                </div>

                <div className="bg-gray-800 p-3 rounded mb-4">
                  <p className="text-gray-400 text-xs mb-2">Top 3 Players (by μ - 3σ):</p>
                  {calculatedData.players.slice(0, 3).map((p, i) => (
                    <div key={p.name} className="flex items-center justify-between text-sm py-1">
                      <span className="text-white">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {p.name}
                      </span>
                      <span className="text-yellow-400 font-mono">{p.conservativeScore.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {promotions.length > 0 && (
                  <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-700 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-5 w-5 text-yellow-400" />
                      <h3 className="text-yellow-400 font-bold">Skill Level Promotions!</h3>
                    </div>
                    <div className="space-y-2">
                      {promotions.map((promo, i) => (
                        <div key={i} className="flex items-center justify-between text-sm bg-gray-800/50 p-2 rounded">
                          <span className="text-white font-semibold">{promo.playerName}</span>
                          <span className="text-yellow-400">
                            {promo.fromLevel} → {promo.toLevel}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSaveAndView}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-navy-900 font-semibold h-12"
                >
                  Save and View Leaderboard
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
