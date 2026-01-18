'use client';

import { useEffect, useState } from 'react';
import { getTournaments } from '@/src/lib/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Trophy, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const data = await getTournaments();
      setTournaments(data);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppRegister = (tournament) => {
    const tournamentDate = tournament.date?.toDate ? tournament.date.toDate() : new Date(tournament.date);
    const message = `Hi Leo Sportz Club! 🏆\n\nI'd like to register for the tournament:\n🏸 ${tournament.name}\n📆 ${format(tournamentDate, 'PPP')}\n📍 ${tournament.location || 'Club Venue'}\n${tournament.entryFee ? `💰 Entry Fee: $${tournament.entryFee}` : ''}\n\nName: [Your Name]\nPhone: [Your Phone Number]\nSkill Level: [Beginner/Intermediate/Advanced]`;
    
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '12892214150';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Trophy className="h-8 w-8 text-primary" />
          Tournaments
        </h1>
        <p className="text-muted-foreground">
          Participate in exciting tournaments and showcase your skills
        </p>
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <MessageCircle className="h-5 w-5" />
            <p className="text-sm font-medium">
              Quick registration via WhatsApp! Click the green button on any tournament.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading tournaments...</div>
      ) : tournaments.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tournaments scheduled yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Check back soon for upcoming tournaments!
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => {
            const tournamentDate = tournament.date?.toDate ? tournament.date.toDate() : new Date(tournament.date);
            
            return (
              <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{tournament.name}</CardTitle>
                    <Badge variant={tournament.status === 'upcoming' ? 'default' : 'secondary'}>
                      {tournament.status || 'upcoming'}
                    </Badge>
                  </div>
                  <CardDescription>{tournament.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {format(tournamentDate, 'PPP')}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {tournament.location || 'Club Venue'}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      {tournament.participants || 0} participants
                    </div>
                    {tournament.entryFee && (
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium">Entry Fee: ${tournament.entryFee}</p>
                      </div>
                    )}
                    
                    <Button 
                      className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white" 
                      onClick={() => handleWhatsAppRegister(tournament)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Register via WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}