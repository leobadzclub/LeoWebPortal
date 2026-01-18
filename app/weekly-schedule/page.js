'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/lib/auth';
import { getPlayerWallet, hasSufficientBalance } from '@/src/lib/wallet';
import { 
  getWeeklySchedule, 
  getScheduleVotes, 
  voteForSchedule, 
  unvoteFromSchedule,
  getUserVote,
  isVotingOpen,
  SCHEDULE_CONFIG 
} from '@/src/lib/weeklySchedule';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Users, Wallet, CheckCircle, XCircle, AlertCircle, History } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { format } from 'date-fns';
import BackButton from '@/src/components/BackButton';
import VotingActivityFeed from '@/src/components/VotingActivityFeed';
import VotingDeadlineCountdown from '@/src/components/VotingDeadlineCountdown';
import WaitlistPromotionNotification from '@/src/components/WaitlistPromotionNotification';

export default function WeeklySchedulePage() {
  const { user, extendedProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('wednesday');
  const [schedules, setSchedules] = useState({});
  const [votes, setVotes] = useState({});
  const [userVotes, setUserVotes] = useState({});
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voteHistory, setVoteHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [promotionNotification, setPromotionNotification] = useState(null);
  
  const isApprovedMember = extendedProfile?.approved === true;

  useEffect(() => {
    if (user && isApprovedMember) {
      fetchAllData();
    } else {
      setLoading(false);
    }
  }, [user, isApprovedMember]);

  const fetchAllData = async () => {
    try {
      // Fetch wallet
      const walletData = await getPlayerWallet(user.uid);
      setWallet(walletData);

      // Fetch all schedules
      const scheduleData = {};
      const votesData = {};
      const userVotesData = {};

      for (const key of Object.keys(SCHEDULE_CONFIG)) {
        const schedule = await getWeeklySchedule(key);
        scheduleData[key] = schedule;

        const { mainVotes, plusOneVotes } = await getScheduleVotes(schedule.id);
        votesData[key] = { mainVotes, plusOneVotes };

        const userVote = await getUserVote(schedule.id, user.uid);
        userVotesData[key] = userVote;
      }

      setSchedules(scheduleData);
      setVotes(votesData);
      setUserVotes(userVotesData);
      
      // Fetch voting history
      await fetchVotingHistory();
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  };

  const fetchVotingHistory = async () => {
    try {
      const votesQuery = query(
        collection(db, 'schedule_votes'),
        where('userId', '==', user.uid),
        limit(100)
      );
      
      const snapshot = await getDocs(votesQuery);
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Sort by date descending
      history.sort((a, b) => {
        if (!a.votedAt || !b.votedAt) return 0;
        return b.votedAt.seconds - a.votedAt.seconds;
      });
      
      setVoteHistory(history);
    } catch (error) {
      console.error('Error fetching voting history:', error);
    }
  };

  const handleVoteChange = async (scheduleKey, value, isPlusOne = false) => {
    if (!user || !isApprovedMember) {
      toast.error('You must be an approved member to vote');
      return;
    }

    try {
      const schedule = schedules[scheduleKey];
      const config = SCHEDULE_CONFIG[scheduleKey];
      const playDate = schedule.playDate.toDate();
      
      // Check voting status
      const votingStatus = isVotingOpen(playDate);
      if (!votingStatus.isOpen) {
        toast.error(votingStatus.reason);
        return;
      }

      if (value === 'unvote') {
        // Unvote
        const result = await unvoteFromSchedule(schedule.id, user.uid);
        
        if (result.promotedPlayer) {
          toast.success(`Vote removed! ${result.promotedPlayer.userName} promoted from +1 list.`);
        } else {
          toast.success('Vote removed');
        }
      } else if (value === 'vote') {
        // Vote (main or +1)
        
        // Check balance (CA$ 50 minimum)
        const hasBalance = await hasSufficientBalance(user.uid, 50);
        if (!hasBalance) {
          toast.error('Insufficient balance. You need at least CA$ 50 to vote.');
          return;
        }

        // Check if already voted
        if (userVotes[scheduleKey]) {
          toast.error('You have already voted for this day');
          return;
        }

        // Determine if this goes to +1 or main
        const currentVotes = votes[scheduleKey];
        const mainFull = currentVotes.mainVotes.length >= config.limit;
        
        // If main is full and voting for main, block it
        if (!isPlusOne && mainFull) {
          toast.error('Main spots are full. You can vote as +1 guest.');
          return;
        }

        // Cast vote
        await voteForSchedule(
          schedule.id,
          user.uid,
          user.displayName,
          user.email,
          isPlusOne
        );

        toast.success(isPlusOne ? 'Added to +1 guest list!' : 'Vote registered!');
      }
      
      fetchAllData();
    } catch (error) {
      console.error('Error handling vote:', error);
      toast.error(`Failed to process vote: ${error.message}`);
    }
  };

  const renderDayTab = (scheduleKey) => {
    const config = SCHEDULE_CONFIG[scheduleKey];
    const schedule = schedules[scheduleKey];
    const dayVotes = votes[scheduleKey];
    const userVote = userVotes[scheduleKey];

    if (!schedule || !dayVotes) {
      return <div className="text-center py-8">Loading...</div>;
    }

    const playDate = schedule.playDate.toDate();
    const votingStatus = isVotingOpen(playDate, config.dayOfWeek);
    const canVote = isApprovedMember && !userVote && votingStatus.isOpen;
    const canUnvoteNow = userVote && votingStatus.isOpen;
    
    const mainFull = dayVotes.mainVotes.length >= config.limit;

    return (
      <div className="space-y-6">
        {/* Status Banner */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-white font-semibold">{config.day}</p>
                  <p className="text-sm text-gray-400">
                    {format(playDate, 'MMMM d, yyyy')} at {format(playDate, 'h:mm a')} EST/EDT
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {wallet && (
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-yellow-400" />
                    <span className="text-white font-semibold">
                      CA$ {wallet.balance.toFixed(2)}
                    </span>
                  </div>
                )}
                
                {votingStatus.isOpen ? (
                  <Badge className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Voting Open
                  </Badge>
                ) : (
                  <Badge className="bg-red-600">
                    <XCircle className="h-3 w-3 mr-1" />
                    Voting Closed
                  </Badge>
                )}
              </div>
            </div>
            
            {!votingStatus.isOpen && (
              <div className="mt-3 text-sm text-gray-400">
                {votingStatus.reason}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vote Action with Radio Buttons */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="py-6">
            <RadioGroup 
              value={userVote ? 'vote' : 'unvote'}
              onValueChange={(value) => handleVoteChange(scheduleKey, value)}
              disabled={!votingStatus.isOpen || !isApprovedMember || (wallet && wallet.balance < 25)}
            >
              <div className="space-y-4">
                {/* Vote Option */}
                <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-700 hover:border-yellow-400 transition-all cursor-pointer">
                  <RadioGroupItem 
                    value="vote" 
                    id={`vote-${scheduleKey}`}
                    disabled={!!userVote || !votingStatus.isOpen || !isApprovedMember || (wallet && wallet.balance < 25)}
                  />
                  <Label 
                    htmlFor={`vote-${scheduleKey}`} 
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-400" />
                          Vote for {config.day}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {!isApprovedMember ? 'Approval required' : 
                           wallet && wallet.balance < 25 ? 'Minimum CA$ 25 required' :
                           !votingStatus.isOpen ? votingStatus.reason :
                           'Register for this session'}
                        </p>
                      </div>
                      {userVote && (
                        <Badge className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {userVote.isWaitlist ? 'On Waitlist' : 'Voted'}
                        </Badge>
                      )}
                    </div>
                  </Label>
                </div>

                {/* Unvote Option */}
                <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-700 hover:border-red-400 transition-all cursor-pointer">
                  <RadioGroupItem 
                    value="unvote" 
                    id={`unvote-${scheduleKey}`}
                    disabled={!userVote || !votingStatus.isOpen}
                  />
                  <Label 
                    htmlFor={`unvote-${scheduleKey}`} 
                    className="flex-1 cursor-pointer"
                  >
                    <div>
                      <p className="text-white font-semibold flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-400" />
                        Remove My Vote
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {!userVote ? 'You haven\'t voted for this day' :
                         !votingStatus.isOpen ? votingStatus.reason :
                         'Unregister from this session'}
                      </p>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Regular List */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-white">Main Players</CardTitle>
              <Badge className="bg-yellow-400 text-navy-900">
                {dayVotes.mainVotes.length} / {config.limit}
              </Badge>
            </div>
            <CardDescription className="text-gray-400">
              {config.limit - dayVotes.mainVotes.length} spots remaining
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dayVotes.mainVotes.length > 0 ? (
              <div className="space-y-2">
                {dayVotes.mainVotes.map((vote, index) => (
                  <div
                    key={vote.id}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-yellow-400 font-bold w-8">{index + 1}</span>
                      <span className="text-white">{vote.userName}</span>
                    </div>
                    {vote.userId === user?.uid && (
                      <Badge className="bg-green-600">You</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No votes yet</p>
            )}
          </CardContent>
        </Card>

        {/* Waitlist */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-white">+1 Guest List</CardTitle>
              <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                {dayVotes.plusOneVotes.length}
              </Badge>
            </div>
            <CardDescription className="text-gray-400">
              Guests waiting for spots
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dayVotes.plusOneVotes.length > 0 ? (
              <div className="space-y-2">
                {dayVotes.plusOneVotes.map((vote, index) => (
                  <div
                    key={vote.id}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 font-bold w-8">W{index + 1}</span>
                      <span className="text-white">{vote.userName}</span>
                    </div>
                    {vote.userId === user?.uid && (
                      <Badge variant="outline" className="border-yellow-400 text-yellow-400">You</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No +1 guests</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-400 mb-8">You need to be logged in to view the weekly schedule.</p>
          <Link href="/">
            <Button className="bg-red-500 hover:bg-red-600">Go to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isApprovedMember) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Approval Required</h1>
          <p className="text-gray-400 mb-8">
            Your membership is pending approval. You'll be able to access the weekly schedule once approved.
          </p>
          <Link href="/profile">
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-navy-900">
              View Profile
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent mb-4"></div>
          <p className="text-gray-400">Loading weekly schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg mb-4">
            <Calendar className="h-10 w-10 text-navy-900" />
          </div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-yellow-400">Weekly</span> Schedule
          </h1>
          <p className="text-xl text-gray-300">
            Vote for your preferred playing sessions
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Voting opens Monday at 6:00 PM EST/EDT
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900 mb-8">
            <TabsTrigger value="wednesday">Wednesday</TabsTrigger>
            <TabsTrigger value="thursday">Thursday</TabsTrigger>
            <TabsTrigger value="saturday">Saturday</TabsTrigger>
            <TabsTrigger value="sunday">Sunday</TabsTrigger>
          </TabsList>

          <TabsContent value="wednesday">{renderDayTab('wednesday')}</TabsContent>
          <TabsContent value="thursday">{renderDayTab('thursday')}</TabsContent>
          <TabsContent value="saturday">{renderDayTab('saturday')}</TabsContent>
          <TabsContent value="sunday">{renderDayTab('sunday')}</TabsContent>
        </Tabs>

        {/* Voting History Section */}
        <div className="max-w-6xl mx-auto mt-12">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <History className="h-6 w-6 text-yellow-400" />
                  <div>
                    <CardTitle className="text-white">My Voting History</CardTitle>
                    <CardDescription className="text-gray-400">
                      View all weeks you've played
                    </CardDescription>
                  </div>
                </div>
                <Button
                  onClick={() => setShowHistory(!showHistory)}
                  variant="outline"
                  className="border-gray-700"
                >
                  {showHistory ? 'Hide History' : 'Show History'}
                </Button>
              </div>
            </CardHeader>
            
            {showHistory && (
              <CardContent>
                {voteHistory.length > 0 ? (
                  <div className="space-y-3">
                    {voteHistory.map((vote) => {
                      const voteDate = vote.votedAt?.toDate ? vote.votedAt.toDate() : new Date();
                      const scheduleInfo = Object.entries(SCHEDULE_CONFIG).find(
                        ([key, config]) => vote.scheduleId?.includes(key)
                      );
                      const dayName = scheduleInfo ? scheduleInfo[1].day : 'Unknown';
                      
                      return (
                        <div
                          key={vote.id}
                          className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-yellow-400" />
                            <div>
                              <p className="text-white font-semibold">{dayName}</p>
                              <p className="text-sm text-gray-400">
                                Voted on: {format(voteDate, 'MMM d, yyyy h:mm a')}
                              </p>
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={vote.isWaitlist ? 'border-yellow-400 text-yellow-400' : 'border-green-400 text-green-400'}
                          >
                            {vote.isWaitlist ? 'Waitlist' : 'Regular'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <History className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">No voting history yet</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Start voting for sessions to build your history!
                    </p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
