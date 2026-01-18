'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Medal, TrendingUp, Target, Zap, Activity, Award, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import BackButton from '@/src/components/BackButton';
import { useAuth } from '@/src/lib/auth';
import { LEADERBOARD_PLAYERS, WEEK1_MATCHES, calculatePlayerStats, getTopPerformers } from '@/src/data/leaderboardData';
import { getTopPerformersFromPlayers } from '@/src/lib/trueskillCalculator';
import { getAllWeeks, getWeekLeaderboard } from '@/src/lib/leaderboardStorage';

export default function LeaderboardPage() {
  const { userProfile } = useAuth();
  const [players, setPlayers] = useState([]);
  const [topPerformers, setTopPerformers] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const isAdmin = userProfile?.role === 'admin';

  useEffect(() => {
    loadWeekData();
  }, [currentWeek]);

  useEffect(() => {
    loadAvailableWeeks();
    // Load initial data
    loadWeekData();
  }, []);

  const loadAvailableWeeks = async () => {
    try {
      const weeks = await getAllWeeks();
      setAvailableWeeks(weeks);
    } catch (error) {
      console.error('Error loading weeks:', error);
    }
  };

  const loadWeekData = async () => {
    setLoading(true);
    try {
      // Try localStorage first
      const savedData = localStorage.getItem('leaderboard_calculated');
      const savedWeek = localStorage.getItem('current_week');
      
      if (savedData && parseInt(savedWeek) === currentWeek) {
        const data = JSON.parse(savedData);
        setPlayers(data.players || []);
        if (data.players) {
          setTopPerformers(getTopPerformersFromPlayers(data.players));
        }
      } else {
        // Try Firestore
        const weekData = await getWeekLeaderboard(currentWeek);
        
        if (weekData.length > 0) {
          setPlayers(weekData);
          setTopPerformers(getTopPerformersFromPlayers(weekData));
        } else {
          // Fall back to sample data
          loadSampleData();
        }
      }
    } catch (error) {
      console.error('Error loading week:', error);
      loadSampleData();
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = () => {
    const playerStats = LEADERBOARD_PLAYERS.map(p => calculatePlayerStats(p.name))
      .sort((a, b) => b.conservativeScore - a.conservativeScore);
    setPlayers(playerStats);
    setTopPerformers(getTopPerformers());
  };

  const getRankMedal = (rank) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-400" />;
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <BackButton />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg mb-4">
            <Trophy className="h-10 w-10 text-navy-900" />
          </div>
          <h1 className="text-5xl font-bold mb-4 font-montserrat">
            <span className="text-yellow-400">TrueSkill</span> Leaderboard
          </h1>
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
              disabled={currentWeek === 1 || loading}
              className="border-gray-700"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <p className="text-xl text-gray-300">
              Week {currentWeek}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(currentWeek + 1)}
              disabled={loading}
              className="border-gray-700"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          {isAdmin && (
            <Link href="/admin/upload-leaderboard">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV Data
              </Button>
            </Link>
          )}
        </div>

        {/* Top 3 Metrics */}
        {topPerformers && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {/* Most Matches */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Most Matches</p>
                    <p className="text-2xl font-bold text-yellow-400">{topPerformers.mostMatches[0]?.name}</p>
                    <p className="text-sm text-gray-500">{topPerformers.mostMatches[0]?.matches} matches</p>
                  </div>
                  <Activity className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            {/* Best Win Rate */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Best Win Rate</p>
                    <p className="text-2xl font-bold text-green-400">{topPerformers.bestWinRate[0]?.name}</p>
                    <p className="text-sm text-gray-500">{topPerformers.bestWinRate[0]?.winRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            {/* Most Points Scored */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Most Points Scored</p>
                    <p className="text-2xl font-bold text-blue-400">{topPerformers.mostPointsScored[0]?.name}</p>
                    <p className="text-sm text-gray-500">{topPerformers.mostPointsScored[0]?.pf} points</p>
                  </div>
                  <Zap className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Leaderboard */}
        <Card className="bg-gray-900 border-gray-800 mb-12">
          <CardHeader>
            <CardTitle className="text-white text-2xl font-montserrat">Rankings</CardTitle>
            <CardDescription className="text-gray-400">
              Sorted by Conservative Score (μ - 3σ)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800 hover:bg-gray-800/50">
                    <TableHead className="text-yellow-400">Rank</TableHead>
                    <TableHead className="text-yellow-400">Player</TableHead>
                    <TableHead className="text-yellow-400 text-center">Matches</TableHead>
                    <TableHead className="text-yellow-400 text-center">Wins</TableHead>
                    <TableHead className="text-yellow-400 text-center">Win %</TableHead>
                    <TableHead className="text-yellow-400 text-center">PF</TableHead>
                    <TableHead className="text-yellow-400 text-center">PA</TableHead>
                    <TableHead className="text-yellow-400 text-center">Rating (μ)</TableHead>
                    <TableHead className="text-yellow-400 text-center">Confidence (σ)</TableHead>
                    <TableHead className="text-yellow-400 text-center">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.map((player, index) => (
                    <TableRow key={player.name} className={`border-gray-800 hover:bg-gray-800/50 ${index < 3 ? 'bg-yellow-900/10' : ''}`}>
                      <TableCell className="font-bold">
                        <div className="flex items-center gap-2">
                          {getRankMedal(index + 1)}
                        </div>
                      </TableCell>
                      <TableCell className="text-white font-semibold">{player.name}</TableCell>
                      <TableCell className="text-center text-gray-300">{player.matches}</TableCell>
                      <TableCell className="text-center text-green-400">{player.wins}</TableCell>
                      <TableCell className="text-center text-gray-300">{player.winRate}%</TableCell>
                      <TableCell className="text-center text-blue-400">{player.pf}</TableCell>
                      <TableCell className="text-center text-purple-400">{player.pa}</TableCell>
                      <TableCell className="text-center text-yellow-400">{player.mu.toFixed(2)}</TableCell>
                      <TableCell className="text-center text-gray-400">{player.sigma.toFixed(2)}</TableCell>
                      <TableCell className="text-center font-bold text-white">{player.conservativeScore.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Top 3 in All Categories */}
        {topPerformers && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Highest Rating */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  Highest Rating (μ)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topPerformers.highestRating.map((p, i) => (
                    <div key={p.name} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                      <span className="text-white">{i + 1}. {p.name}</span>
                      <span className="text-yellow-400 font-bold">{p.mu.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Most Confident */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-400" />
                  Most Consistent (Lowest σ)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topPerformers.mostConfident.map((p, i) => (
                    <div key={p.name} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                      <span className="text-white">{i + 1}. {p.name}</span>
                      <span className="text-green-400 font-bold">{p.sigma.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Biggest Point Differential */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-400" />
                  Biggest Point Differential
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topPerformers.biggestPointDiff.map((p, i) => (
                    <div key={p.name} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                      <span className="text-white">{i + 1}. {p.name}</span>
                      <span className="text-orange-400 font-bold">+{p.pointDiff}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Best Average Score */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-pink-400" />
                  Best Average Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topPerformers.bestAvgScore.map((p, i) => (
                    <div key={p.name} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                      <span className="text-white">{i + 1}. {p.name}</span>
                      <span className="text-pink-400 font-bold">{p.avgPF} avg</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Weekly Results */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-2xl font-montserrat">Week 1 Match Results</CardTitle>
            <CardDescription className="text-gray-400">
              {WEEK1_MATCHES.length} matches played
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {WEEK1_MATCHES.map((match, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`text-white font-semibold ${match.winner === 1 ? 'text-green-400' : ''}`}>
                        {match.team1.join(' / ')}
                      </span>
                      <span className="text-gray-500">vs</span>
                      <span className={`text-white font-semibold ${match.winner === 2 ? 'text-green-400' : ''}`}>
                        {match.team2.join(' / ')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="border-gray-700 text-white font-mono">
                      {match.score}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
