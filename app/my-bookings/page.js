'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/lib/auth';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, X, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      // Fetch user's registrations
      const q = query(
        collection(db, 'registrations'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const bookingsData = [];
      for (const doc of snapshot.docs) {
        const registration = { id: doc.id, ...doc.data() };
        
        // Fetch schedule details
        const scheduleDoc = await getDocs(query(collection(db, 'schedules')));
        const schedule = scheduleDoc.docs.find(s => s.id === registration.scheduleId);
        
        if (schedule) {
          bookingsData.push({
            ...registration,
            schedule: { id: schedule.id, ...schedule.data() },
          });
        }
      }
      
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId, scheduleTitle) => {
    if (!confirm(`Are you sure you want to cancel your registration for "${scheduleTitle}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'registrations', bookingId));
      toast.success('Booking cancelled successfully');
      fetchBookings(); // Refresh list
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Please Sign In</h1>
        <p className="text-muted-foreground mb-8">You need to sign in to view your bookings.</p>
        <Link href="/">
          <Button>Go to Home</Button>
        </Link>
      </div>
    );
  }

  const upcomingBookings = bookings.filter(b => {
    const scheduleDate = b.schedule.date?.toDate ? b.schedule.date.toDate() : new Date(b.schedule.date);
    return scheduleDate >= new Date();
  });

  const pastBookings = bookings.filter(b => {
    const scheduleDate = b.schedule.date?.toDate ? b.schedule.date.toDate() : new Date(b.schedule.date);
    return scheduleDate < new Date();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg mb-4">
            <Calendar className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4">My Bookings</h1>
          <p className="text-xl text-muted-foreground">
            Manage your session registrations and view history
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading your bookings...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Upcoming Bookings */}
            <div>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                Upcoming Sessions ({upcomingBookings.length})
              </h2>
              
              {upcomingBookings.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-xl text-muted-foreground mb-4">No upcoming bookings</p>
                    <Link href="/play">
                      <Button>Browse Sessions</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingBookings.map((booking) => {
                    const scheduleDate = booking.schedule.date?.toDate 
                      ? booking.schedule.date.toDate() 
                      : new Date(booking.schedule.date);
                    
                    return (
                      <Card key={booking.id} className="border-2 border-green-200 dark:border-green-800">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-xl">{booking.schedule.title}</CardTitle>
                              <CardDescription>
                                Registered on {format(booking.createdAt?.toDate ? booking.createdAt.toDate() : new Date(), 'PPP')}
                              </CardDescription>
                            </div>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                              Confirmed
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{format(scheduleDate, 'EEEE, MMMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{booking.schedule.time}</span>
                            </div>
                            {booking.schedule.location && (
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{booking.schedule.location}</span>
                              </div>
                            )}
                            {booking.schedule.fee && (
                              <div className="pt-2 border-t">
                                <p className="text-sm font-medium">Session Fee: ${booking.schedule.fee}</p>
                              </div>
                            )}
                          </div>
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full mt-4"
                            onClick={() => handleCancelBooking(booking.id, booking.schedule.title)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel Registration
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Past Bookings */}
            <div>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="h-8 w-8 text-gray-500" />
                Past Sessions ({pastBookings.length})
              </h2>
              
              {pastBookings.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No past bookings yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastBookings.map((booking) => {
                    const scheduleDate = booking.schedule.date?.toDate 
                      ? booking.schedule.date.toDate() 
                      : new Date(booking.schedule.date);
                    
                    return (
                      <Card key={booking.id} className="opacity-75">
                        <CardHeader>
                          <CardTitle className="text-lg">{booking.schedule.title}</CardTitle>
                          <CardDescription>
                            {format(scheduleDate, 'PPP')}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Badge variant="secondary">Completed</Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
