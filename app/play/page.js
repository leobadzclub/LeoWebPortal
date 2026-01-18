'use client';

import { useEffect, useState } from 'react';
import { getSchedules, createRegistration, getRegistrations } from '@/src/lib/firestore';
import { useAuth } from '@/src/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function PlayPage() {
  const { user, userProfile } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [registrations, setRegistrations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const data = await getSchedules();
      setSchedules(data);
      
      // Fetch registrations for each schedule
      const regData = {};
      for (const schedule of data) {
        const regs = await getRegistrations(schedule.id);
        regData[schedule.id] = regs;
      }
      setRegistrations(regData);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (scheduleId) => {
    if (!user) {
      toast.error('Please sign in to register');
      return;
    }

    // Check if already registered
    const existingRegs = registrations[scheduleId] || [];
    const alreadyRegistered = existingRegs.some(reg => reg.userId === user.uid);
    
    if (alreadyRegistered) {
      toast.error('You are already registered for this session');
      return;
    }

    try {
      await createRegistration(scheduleId, user.uid, user.displayName);
      toast.success('Successfully registered!');
      fetchSchedules(); // Refresh
    } catch (error) {
      console.error('Error registering:', error);
      toast.error('Failed to register. Please try again.');
    }
  };

  const handleWhatsAppRegister = (schedule) => {
    const scheduleDate = schedule.date?.toDate ? schedule.date.toDate() : new Date(schedule.date);
    const message = `Hi Leo Sportz Club! 🏸\n\nI'd like to register for:\n📅 ${schedule.title}\n📆 ${format(scheduleDate, 'PPP')}\n🕒 ${schedule.time}\n📍 ${schedule.location || 'Club Venue'}\n\nName: ${user?.displayName || '[Your Name]'}\nPhone: [Your Phone Number]`;
    
    const whatsappUrl = `https://wa.me/12892214150?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Calendar className="h-8 w-8 text-primary" />
          Weekly Play Schedule
        </h1>
        <p className="text-muted-foreground">
          Register for upcoming play sessions and join the action
        </p>
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <MessageCircle className="h-5 w-5" />
            <p className="text-sm font-medium">
              Prefer WhatsApp? Click the WhatsApp button on any session to register instantly!
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading schedule...</div>
      ) : schedules.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No play sessions scheduled yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Check back soon for upcoming sessions!
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedules.map((schedule) => {
            const scheduleDate = schedule.date?.toDate ? schedule.date.toDate() : new Date(schedule.date);
            const sessionRegs = registrations[schedule.id] || [];
            const isRegistered = user && sessionRegs.some(reg => reg.userId === user.uid);
            const isFull = schedule.maxPlayers && sessionRegs.length >= schedule.maxPlayers;
            
            return (
              <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{schedule.title}</CardTitle>
                    <Badge variant={isFull ? 'destructive' : isRegistered ? 'secondary' : 'default'}>
                      {isFull ? 'Full' : isRegistered ? 'Registered' : 'Open'}
                    </Badge>
                  </div>
                  <CardDescription>{schedule.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {format(scheduleDate, 'PPP')}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      {schedule.time}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {schedule.location || 'Club Venue'}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      {sessionRegs.length} / {schedule.maxPlayers || '∞'} registered
                    </div>
                    {schedule.fee && (
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium">Session Fee: ${schedule.fee}</p>
                      </div>
                    )}
                    
                    <div className="space-y-2 mt-4">
                      <Button 
                        className="w-full" 
                        onClick={() => handleRegister(schedule.id)}
                        disabled={!user || isRegistered || isFull}
                      >
                        {!user ? 'Sign In to Register' : isRegistered ? 'Already Registered' : isFull ? 'Session Full' : 'Register Now'}
                      </Button>
                      
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white" 
                        onClick={() => handleWhatsAppRegister(schedule)}
                        variant="secondary"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Register via WhatsApp
                      </Button>
                    </div>
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