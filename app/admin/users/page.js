'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/lib/auth';
import { collection, getDocs, doc, updateDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Clock, Search, Shield, User } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import BackButton from '@/src/components/BackButton';

export default function AdminUsersPage() {
  const { user, userProfile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, approved, pending, admin
  
  const isAdmin = userProfile?.role === 'admin';

  useEffect(() => {
    if (user && isAdmin) {
      fetchUsers();
    }
  }, [user, isAdmin]);

  const fetchUsers = async () => {
    try {
      const usersQuery = query(collection(db, 'users'), limit(500));
      const usersSnapshot = await getDocs(usersQuery);
      
      const profilesQuery = query(collection(db, 'profiles'), limit(500));
      const profilesSnapshot = await getDocs(profilesQuery);
      
      // Merge users and profiles data
      const usersMap = new Map();
      
      usersSnapshot.docs.forEach(doc => {
        usersMap.set(doc.id, { id: doc.id, ...doc.data(), source: 'users' });
      });
      
      profilesSnapshot.docs.forEach(doc => {
        const existing = usersMap.get(doc.id);
        if (existing) {
          usersMap.set(doc.id, { ...existing, ...doc.data() });
        } else {
          usersMap.set(doc.id, { id: doc.id, ...doc.data(), source: 'profiles' });
        }
      });
      
      const usersList = Array.from(usersMap.values());
      usersList.sort((a, b) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (a.role !== 'admin' && b.role === 'admin') return 1;
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      });
      
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId, userName) => {
    try {
      // Update both collections to ensure consistency
      const profileRef = doc(db, 'profiles', userId);
      await updateDoc(profileRef, {
        approved: true,
        updatedAt: new Date(),
      });

      toast.success(`${userName} approved successfully!`);
      fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error(`Failed to approve user: ${error.message}`);
    }
  };

  const handleUnapprove = async (userId, userName) => {
    if (!confirm(`Are you sure you want to unapprove ${userName}?`)) return;
    
    try {
      const profileRef = doc(db, 'profiles', userId);
      await updateDoc(profileRef, {
        approved: false,
        updatedAt: new Date(),
      });

      toast.success(`${userName} unapproved`);
      fetchUsers();
    } catch (error) {
      console.error('Error unapproving user:', error);
      toast.error(`Failed to unapprove user: ${error.message}`);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filter === 'approved') return u.approved === true;
    if (filter === 'pending') return u.approved !== true;
    if (filter === 'admin') return u.role === 'admin';
    
    return true;
  });

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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent mb-4"></div>
          <p className="text-gray-400">Loading users...</p>
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-yellow-400">User</span> Management
          </h1>
          <p className="text-gray-400">Manage user profiles and approvals</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-white">{users.length}</p>
                </div>
                <User className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Approved</p>
                  <p className="text-2xl font-bold text-green-400">
                    {users.filter(u => u.approved).length}
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
                  <p className="text-sm text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {users.filter(u => !u.approved).length}
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
                  <p className="text-sm text-gray-400">Admins</p>
                  <p className="text-2xl font-bold text-red-400">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                  className={filter === 'all' ? 'bg-yellow-400 text-navy-900' : 'border-gray-700'}
                >
                  All
                </Button>
                <Button
                  variant={filter === 'approved' ? 'default' : 'outline'}
                  onClick={() => setFilter('approved')}
                  className={filter === 'approved' ? 'bg-green-600' : 'border-gray-700'}
                >
                  Approved
                </Button>
                <Button
                  variant={filter === 'pending' ? 'default' : 'outline'}
                  onClick={() => setFilter('pending')}
                  className={filter === 'pending' ? 'bg-yellow-600' : 'border-gray-700'}
                >
                  Pending
                </Button>
                <Button
                  variant={filter === 'admin' ? 'default' : 'outline'}
                  onClick={() => setFilter('admin')}
                  className={filter === 'admin' ? 'bg-red-600' : 'border-gray-700'}
                >
                  Admins
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Users ({filteredUsers.length})</CardTitle>
            <CardDescription className="text-gray-400">
              Manage user approvals and view details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((userData) => (
                  <div
                    key={userData.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-800 rounded-lg gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-white font-semibold">
                          {userData.displayName || 'No name'}
                        </p>
                        {userData.role === 'admin' && (
                          <Badge className="bg-red-600">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                        {userData.approved ? (
                          <Badge className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-600">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{userData.email}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      {userData.approved ? (
                        <Button
                          onClick={() => handleUnapprove(userData.id, userData.displayName || userData.email)}
                          variant="outline"
                          size="sm"
                          className="border-red-600 text-red-400 hover:bg-red-900/20"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Unapprove
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleApprove(userData.id, userData.displayName || userData.email)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve Profile
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No users found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
