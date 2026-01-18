'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/lib/auth';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, Mail, Phone, User, Eye, Calendar, Award } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { format } from 'date-fns';
import BackButton from '@/src/components/BackButton';
import { getSkillLevelColors } from '@/src/lib/skillLevelColors';

export default function AdminRegistrationsPage() {
  const { user, userProfile } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [approvedMembers, setApprovedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // all, pending, approved, rejected
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [viewingDetails, setViewingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('registrations');

  const isAdmin = userProfile?.role === 'admin';

  useEffect(() => {
    if (user && isAdmin) {
      fetchRegistrations();
    } else if (!isAdmin && !loading) {
      setLoading(false);
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
      console.log('Fetched registrations:', regs);
      setRegistrations(regs);
      
      // Fetch approved members from profiles collection
      const profilesSnapshot = await getDocs(collection(db, 'profiles'));
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      // Merge users and profiles
      const usersMap = new Map();
      usersSnapshot.docs.forEach(doc => {
        usersMap.set(doc.id, { id: doc.id, ...doc.data() });
      });
      
      profilesSnapshot.docs.forEach(doc => {
        const existing = usersMap.get(doc.id);
        if (existing) {
          usersMap.set(doc.id, { ...existing, ...doc.data() });
        }
      });
      
      // Filter approved members with skill level
      const approved = Array.from(usersMap.values())
        .filter(user => user.approved === true && user.skillLevel)
        .sort((a, b) => {
          const skillOrder = { 'beginner': 1, 'intermediate': 2, 'intermediate+': 3, 'advanced': 4 };
          return (skillOrder[a.skillLevel] || 0) - (skillOrder[b.skillLevel] || 0);
        });
      
      setApprovedMembers(approved);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error(`Failed to load registrations: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (registration) => {
    setSelectedRegistration(registration);
    setViewingDetails(true);
  };

  const handleApprove = async (registrationId, regData) => {
    try {
      // Update registration status
      await updateDoc(doc(db, 'member_registrations', registrationId), {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: user.uid,
      });
      
      toast.success('Registration approved!');
      setViewingDetails(false);
      fetchRegistrations();
    } catch (error) {
      console.error('Error approving registration:', error);
      toast.error(`Failed to approve: ${error.message}`);
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
      setViewingDetails(false);
      fetchRegistrations();
    } catch (error) {
      console.error('Error rejecting registration:', error);
      toast.error('Failed to reject registration');
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    if (filter === 'all') return true;
    return reg.status === filter;
  });

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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent mb-4"></div>
          <p className="text-gray-400">Loading registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-yellow-400">Member</span> Registrations
          </h1>
          <p className="text-gray-400">Review and approve new member registrations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Registrations</p>
                  <p className="text-2xl font-bold text-white">{registrations.length}</p>
                </div>
                <User className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {registrations.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Approved</p>
                  <p className="text-2xl font-bold text-green-400">
                    {registrations.filter(r => r.status === 'approved').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Rejected</p>
                  <p className="text-2xl font-bold text-red-400">
                    {registrations.filter(r => r.status === 'rejected').length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Registrations and Approved Members */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900">
            <TabsTrigger value="registrations">Registration Requests</TabsTrigger>
            <TabsTrigger value="approved">Approved Members</TabsTrigger>
          </TabsList>

          {/* Registration Requests Tab */}
          <TabsContent value="registrations">
            {/* Filters */}
            <Card className="bg-gray-900 border-gray-800 mb-8">
              <CardContent className="py-4">
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-yellow-400 text-navy-900' : 'border-gray-700'}
              >
                All ({registrations.length})
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilter('pending')}
                className={filter === 'pending' ? 'bg-yellow-600' : 'border-gray-700'}
              >
                Pending ({registrations.filter(r => r.status === 'pending').length})
              </Button>
              <Button
                variant={filter === 'approved' ? 'default' : 'outline'}
                onClick={() => setFilter('approved')}
                className={filter === 'approved' ? 'bg-green-600' : 'border-gray-700'}
              >
                Approved ({registrations.filter(r => r.status === 'approved').length})
              </Button>
              <Button
                variant={filter === 'rejected' ? 'default' : 'outline'}
                onClick={() => setFilter('rejected')}
                className={filter === 'rejected' ? 'bg-red-600' : 'border-gray-700'}
              >
                Rejected ({registrations.filter(r => r.status === 'rejected').length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Preview Dialog */}
        <Dialog open={viewingDetails} onOpenChange={setViewingDetails}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                Registration Details
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Complete information submitted by the applicant
              </DialogDescription>
            </DialogHeader>
            
            {selectedRegistration && (
              <div className="space-y-6 mt-4">
                {/* Status and Registration Time */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {selectedRegistration.status === 'pending' && (
                      <Badge className="bg-yellow-600">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Approval
                      </Badge>
                    )}
                    {selectedRegistration.status === 'approved' && (
                      <Badge className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                    )}
                    {selectedRegistration.status === 'rejected' && (
                      <Badge className="bg-red-600">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Registered: {selectedRegistration.registeredAt?.toDate?.() ? 
                      format(selectedRegistration.registeredAt.toDate(), 'MMM d, yyyy h:mm a') : 
                      'Unknown'}
                  </div>
                </div>

                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-yellow-400 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-800 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Full Name</p>
                      <p className="text-white font-semibold text-lg">{selectedRegistration.fullName || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Email</p>
                      <p className="text-white flex items-center gap-2">
                        <Mail className="h-4 w-4 text-yellow-400" />
                        {selectedRegistration.email}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Phone Number</p>
                      <p className="text-white flex items-center gap-2">
                        <Phone className="h-4 w-4 text-yellow-400" />
                        {selectedRegistration.phone}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Gender</p>
                      <p className="text-white capitalize">{selectedRegistration.gender}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Skill Level</p>
                      <p className="text-white capitalize flex items-center gap-2">
                        <Award className="h-4 w-4 text-yellow-400" />
                        {selectedRegistration.skillLevel}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Name Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold text-yellow-400 mb-4">Name Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-800 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">First Name</p>
                      <p className="text-white">{selectedRegistration.firstName}</p>
                    </div>
                    
                    {selectedRegistration.middleName && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Middle Name</p>
                        <p className="text-white">{selectedRegistration.middleName}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Last Name</p>
                      <p className="text-white">{selectedRegistration.lastName}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-800">
                  {selectedRegistration.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleReject(selectedRegistration.id)}
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-900/20"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleApprove(selectedRegistration.id, selectedRegistration)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve Registration
                      </Button>
                    </>
                  )}
                  
                  <Button
                    onClick={() => setViewingDetails(false)}
                    variant="outline"
                    className="border-gray-700"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Registrations List */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">
              {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)} Registrations ({filteredRegistrations.length})
            </CardTitle>
            <CardDescription className="text-gray-400">
              Review member registration requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRegistrations.length > 0 ? (
              <div className="space-y-4">
                {filteredRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-800 rounded-lg gap-4 hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-yellow-400 text-navy-900 rounded-full w-10 h-10 flex items-center justify-center font-bold">
                          {reg.fullName?.[0] || reg.firstName?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-lg">
                            {reg.fullName || `${reg.firstName} ${reg.lastName}`}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {reg.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {reg.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 ml-13">
                        {reg.status === 'pending' && (
                          <Badge className="bg-yellow-600">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                        {reg.status === 'approved' && (
                          <Badge className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approved
                          </Badge>
                        )}
                        {reg.status === 'rejected' && (
                          <Badge className="bg-red-600">
                            <XCircle className="h-3 w-3 mr-1" />
                            Rejected
                          </Badge>
                        )}
                        <Badge variant="outline" className="border-gray-600 text-gray-400 capitalize">
                          {reg.skillLevel}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {reg.registeredAt?.toDate?.() ? 
                            format(reg.registeredAt.toDate(), 'MMM d, yyyy') : 
                            'Unknown date'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleViewDetails(reg)}
                        variant="outline"
                        size="sm"
                        className="border-blue-600 text-blue-400 hover:bg-blue-900/20"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      
                      {reg.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => handleReject(reg.id)}
                            variant="outline"
                            size="sm"
                            className="border-red-600 text-red-400 hover:bg-red-900/20"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            onClick={() => handleApprove(reg.id, reg)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {filter === 'pending' ? 'No pending registrations' : 
                   filter === 'approved' ? 'No approved registrations' :
                   filter === 'rejected' ? 'No rejected registrations' :
                   'No registrations found'}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {filter === 'pending' && 'New registrations will appear here'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        </TabsContent>

          {/* Approved Members Tab */}
          <TabsContent value="approved">
            <Card className="bg-gray-900 border-gray-800 mt-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  Approved Members ({approvedMembers.length})
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Members categorized by skill level
                </CardDescription>
              </CardHeader>
              <CardContent>
                {approvedMembers.length > 0 ? (
                  <div className="space-y-8">
                    {/* Beginner */}
                    {approvedMembers.filter(m => m.skillLevel === 'beginner').length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <span className={`px-4 py-2 rounded-lg ${getSkillLevelColors('beginner').bg} ${getSkillLevelColors('beginner').text} border-2 ${getSkillLevelColors('beginner').border}`}>
                            🔵 Beginner ({approvedMembers.filter(m => m.skillLevel === 'beginner').length})
                          </span>
                        </h3>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-blue-400/20 hover:bg-blue-900/10">
                                <TableHead className="text-blue-300">Name</TableHead>
                                <TableHead className="text-blue-300">Phone</TableHead>
                                <TableHead className="text-blue-300">Email</TableHead>
                                <TableHead className="text-blue-300">Skill Level</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {approvedMembers.filter(m => m.skillLevel === 'beginner').map((member) => (
                                <TableRow key={member.id} className="border-blue-400/20 hover:bg-blue-900/10">
                                  <TableCell className="text-white font-medium">{member.displayName}</TableCell>
                                  <TableCell className="text-gray-300">{member.phone || 'N/A'}</TableCell>
                                  <TableCell className="text-gray-300">{member.email}</TableCell>
                                  <TableCell>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getSkillLevelColors('beginner').bg} ${getSkillLevelColors('beginner').text} border ${getSkillLevelColors('beginner').border}`}>
                                      Beginner
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                    {/* Intermediate */}
                    {approvedMembers.filter(m => m.skillLevel === 'intermediate').length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <span className={`px-4 py-2 rounded-lg ${getSkillLevelColors('intermediate').bg} ${getSkillLevelColors('intermediate').text} border-2 ${getSkillLevelColors('intermediate').border}`}>
                            🟣 Intermediate ({approvedMembers.filter(m => m.skillLevel === 'intermediate').length})
                          </span>
                        </h3>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-violet-400/20 hover:bg-violet-900/10">
                                <TableHead className="text-violet-300">Name</TableHead>
                                <TableHead className="text-violet-300">Phone</TableHead>
                                <TableHead className="text-violet-300">Email</TableHead>
                                <TableHead className="text-violet-300">Skill Level</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {approvedMembers.filter(m => m.skillLevel === 'intermediate').map((member) => (
                                <TableRow key={member.id} className="border-violet-400/20 hover:bg-violet-900/10">
                                  <TableCell className="text-white font-medium">{member.displayName}</TableCell>
                                  <TableCell className="text-gray-300">{member.phone || 'N/A'}</TableCell>
                                  <TableCell className="text-gray-300">{member.email}</TableCell>
                                  <TableCell>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getSkillLevelColors('intermediate').bg} ${getSkillLevelColors('intermediate').text} border ${getSkillLevelColors('intermediate').border}`}>
                                      Intermediate
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                    {/* Intermediate+ */}
                    {approvedMembers.filter(m => m.skillLevel === 'intermediate+').length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <span className={`px-4 py-2 rounded-lg ${getSkillLevelColors('intermediate+').bg} ${getSkillLevelColors('intermediate+').text} border-2 ${getSkillLevelColors('intermediate+').border}`}>
                            🟡 Intermediate+ ({approvedMembers.filter(m => m.skillLevel === 'intermediate+').length})
                          </span>
                        </h3>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-yellow-400/20 hover:bg-yellow-900/10">
                                <TableHead className="text-yellow-300">Name</TableHead>
                                <TableHead className="text-yellow-300">Phone</TableHead>
                                <TableHead className="text-yellow-300">Email</TableHead>
                                <TableHead className="text-yellow-300">Skill Level</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {approvedMembers.filter(m => m.skillLevel === 'intermediate+').map((member) => (
                                <TableRow key={member.id} className="border-yellow-400/20 hover:bg-yellow-900/10">
                                  <TableCell className="text-white font-medium">{member.displayName}</TableCell>
                                  <TableCell className="text-gray-300">{member.phone || 'N/A'}</TableCell>
                                  <TableCell className="text-gray-300">{member.email}</TableCell>
                                  <TableCell>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getSkillLevelColors('intermediate+').bg} ${getSkillLevelColors('intermediate+').text} border ${getSkillLevelColors('intermediate+').border}`}>
                                      Intermediate+
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                    {/* Advanced */}
                    {approvedMembers.filter(m => m.skillLevel === 'advanced').length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <span className={`px-4 py-2 rounded-lg ${getSkillLevelColors('advanced').bg} ${getSkillLevelColors('advanced').text} border-2 ${getSkillLevelColors('advanced').border}`}>
                            🟠 Advanced ({approvedMembers.filter(m => m.skillLevel === 'advanced').length})
                          </span>
                        </h3>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-orange-400/20 hover:bg-orange-900/10">
                                <TableHead className="text-orange-300">Name</TableHead>
                                <TableHead className="text-orange-300">Phone</TableHead>
                                <TableHead className="text-orange-300">Email</TableHead>
                                <TableHead className="text-orange-300">Skill Level</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {approvedMembers.filter(m => m.skillLevel === 'advanced').map((member) => (
                                <TableRow key={member.id} className="border-orange-400/20 hover:bg-orange-900/10">
                                  <TableCell className="text-white font-medium">{member.displayName}</TableCell>
                                  <TableCell className="text-gray-300">{member.phone || 'N/A'}</TableCell>
                                  <TableCell className="text-gray-300">{member.email}</TableCell>
                                  <TableCell>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getSkillLevelColors('advanced').bg} ${getSkillLevelColors('advanced').text} border ${getSkillLevelColors('advanced').border}`}>
                                      Advanced
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <User className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No approved members yet</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Approved members will be categorized by skill level here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
