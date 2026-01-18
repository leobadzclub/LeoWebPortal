'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/lib/auth';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Mail, Phone, User } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { format } from 'date-fns';

export default function AdminRegistrationsPage() {
  const { user, userProfile } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  const isAdmin = userProfile?.role === 'admin';

  useEffect(() => {
    if (user && isAdmin) {
      fetchRegistrations();
    }
  }, [user, isAdmin]);

  const fetchRegistrations = async () => {
    try {
      const q = query(collection(db, 'member_registrations'), orderBy('registeredAt', 'desc'));
      const snapshot = await getDocs(q);
      const regs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRegistrations(regs);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (registrationId) => {
    try {
      await updateDoc(doc(db, 'member_registrations', registrationId), {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: user.uid,
      });
      toast.success('Registration approved!');
      fetchRegistrations();
    } catch (error) {
      console.error('Error approving registration:', error);
      toast.error('Failed to approve registration');
    }
  };

  const handleReject = async (registrationId) => {
    if (!confirm('Are you sure you want to reject this registration?')) return;
    
    try {
      await updateDoc(doc(db, 'member_registrations', registrationId), {
        status: 'rejected',
        rejectedAt: new Date(),
        rejectedBy: user.uid,
      });
      toast.success('Registration rejected');
      fetchRegistrations();
    } catch (error) {
      console.error('Error rejecting registration:', error);
      toast.error('Failed to reject registration');
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-8">You need admin privileges to access this page.</p>
        <Link href="/">
          <Button>Go to Home</Button>
        </Link>
      </div>
    );
  }

  const filteredRegistrations = filter === 'all' 
    ? registrations 
    : registrations.filter(r => r.status === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Member Registrations</h1>
          <p className="text-muted-foreground">Review and approve member applications</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All ({registrations.length})
          </Button>
          <Button 
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
          >
            Pending ({registrations.filter(r => r.status === 'pending').length})
          </Button>
          <Button 
            variant={filter === 'approved' ? 'default' : 'outline'}
            onClick={() => setFilter('approved')}
          >
            Approved ({registrations.filter(r => r.status === 'approved').length})
          </Button>
          <Button 
            variant={filter === 'rejected' ? 'default' : 'outline'}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({registrations.filter(r => r.status === 'rejected').length})
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading registrations...</p>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No registrations found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRegistrations.map((registration) => (
              <Card key={registration.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{registration.fullName}</CardTitle>
                      <CardDescription>
                        {registration.registeredAt?.toDate 
                          ? format(registration.registeredAt.toDate(), 'PPP')
                          : 'Date unknown'}
                      </CardDescription>
                    </div>
                    <Badge 
                      className={
                        registration.status === 'approved' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : registration.status === 'rejected'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                      }
                    >
                      {registration.status === 'pending' ? (
                        <><Clock className="h-3 w-3 mr-1" /> Pending</>
                      ) : registration.status === 'approved' ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Approved</>
                      ) : (
                        <><XCircle className="h-3 w-3 mr-1" /> Rejected</>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{registration.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{registration.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm capitalize">{registration.gender}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <Badge variant="outline">{registration.skillLevel}</Badge>
                    </div>
                    
                    {registration.status === 'pending' && (
                      <div className="flex gap-2 pt-4">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(registration.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleReject(registration.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
