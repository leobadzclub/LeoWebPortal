'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, getDoc, setDoc, deleteDoc, query, where, limit } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle, XCircle, Clock, Eye, Mail, Phone, Calendar, Shield, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getSkillLevelColors } from '@/src/lib/skillLevelColors';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewingProfile, setViewingProfile] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersQuery = query(collection(db, 'users'), limit(500));
      const usersSnapshot = await getDocs(usersQuery);
      
      const profilesQuery = query(collection(db, 'profiles'), limit(500));
      const profilesSnapshot = await getDocs(profilesQuery);
      
      const usersMap = new Map();
      
      usersSnapshot.docs.forEach(docSnap => {
        usersMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
      });
      
      profilesSnapshot.docs.forEach(docSnap => {
        const existing = usersMap.get(docSnap.id);
        if (existing) {
          usersMap.set(docSnap.id, { ...existing, ...docSnap.data() });
        } else {
          usersMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
        }
      });
      
      setUsers(Array.from(usersMap.values()));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = async (userId) => {
    try {
      const profileRef = doc(db, 'profiles', userId);
      const profileSnap = await getDoc(profileRef);
      
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      const fullProfile = {
        id: userId,
        ...userSnap.data(),
        ...profileSnap.data(),
      };
      
      setSelectedUser(fullProfile);
      setViewingProfile(true);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: newRole });
      
      const profileRef = doc(db, 'profiles', userId);
      await updateDoc(profileRef, { role: newRole });
      
      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleApprove = async (userId, userName) => {
    try {
      const profileRef = doc(db, 'profiles', userId);
      // Use setDoc with merge to create if doesn't exist
      await setDoc(profileRef, {
        approved: true,
        updatedAt: new Date(),
      }, { merge: true });

      toast.success(`${userName} approved successfully!`);
      setViewingProfile(false);
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
      // Use setDoc with merge to handle missing documents
      await setDoc(profileRef, {
        approved: false,
        updatedAt: new Date(),
      }, { merge: true });

      toast.success(`${userName} unapproved`);
      setViewingProfile(false);
      fetchUsers();
    } catch (error) {
      console.error('Error unapproving user:', error);
      toast.error(`Failed to unapprove user: ${error.message}`);
    }
  };

  const handleDeleteAccount = async (userId, userName) => {
    // Double confirmation for safety
    const confirmMessage = `⚠️ WARNING: This will permanently delete ${userName}'s account and ALL their data.\n\nThis includes:\n- User profile\n- Voting history\n- Wallet balance\n- All associated data\n\nThis action CANNOT be undone.\n\nType "DELETE" to confirm:`;
    
    const userInput = prompt(confirmMessage);
    
    if (userInput !== 'DELETE') {
      toast.error('Account deletion cancelled');
      return;
    }
    
    try {
      // Delete from profiles collection
      const profileRef = doc(db, 'profiles', userId);
      await deleteDoc(profileRef);
      
      // Delete from users collection
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
      
      // Delete wallet if exists
      try {
        const walletRef = doc(db, 'player_wallets', userId);
        await deleteDoc(walletRef);
      } catch (err) {
        console.log('No wallet to delete');
      }
      
      // Delete all schedule votes by this user
      try {
        const votesQuery = query(
          collection(db, 'schedule_votes'),
          where('userId', '==', userId)
        );
        const votesSnapshot = await getDocs(votesQuery);
        const deletePromises = votesSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      } catch (err) {
        console.log('No votes to delete');
      }

      toast.success(`${userName}'s account has been permanently deleted`);
      setViewingProfile(false);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(`Failed to delete account: ${error.message}`);
    }
  };

  return (
    <>
      {/* Profile Preview Dialog */}
      <Dialog open={viewingProfile} onOpenChange={setViewingProfile}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedUser?.photoURL} alt={selectedUser?.displayName} />
                <AvatarFallback className="bg-yellow-400 text-navy-900">
                  {selectedUser?.displayName?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div>{selectedUser?.displayName || 'User Profile'}</div>
                <div className="text-sm font-normal text-gray-400">{selectedUser?.email}</div>
              </div>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Review member information before approval
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6 mt-4">
              {/* Status Badges */}
              <div className="flex gap-2">
                {selectedUser.approved ? (
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
                {selectedUser.role === 'admin' && (
                  <Badge className="bg-red-600">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>

              {/* Profile Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-800 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Email</p>
                  <p className="text-white flex items-center gap-2">
                    <Mail className="h-4 w-4 text-yellow-400" />
                    {selectedUser.email || 'Not set'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">Phone Number</p>
                  <p className="text-white flex items-center gap-2">
                    <Phone className="h-4 w-4 text-yellow-400" />
                    {selectedUser.phone || 'Not set'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">Skill Level</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border-2 ${getSkillLevelColors(selectedUser.skillLevel).bg} ${getSkillLevelColors(selectedUser.skillLevel).text} ${getSkillLevelColors(selectedUser.skillLevel).border}`}>
                    {getSkillLevelColors(selectedUser.skillLevel).label}
                  </span>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">Gender</p>
                  <p className="text-white capitalize">{selectedUser.gender?.replace('-', ' ') || 'Not set'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">Date of Birth</p>
                  <p className="text-white flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-yellow-400" />
                    {selectedUser.dateOfBirth || 'Not set'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">T-Shirt Size</p>
                  <p className="text-white uppercase">{selectedUser.tshirtSize || 'Not set'}</p>
                </div>
                
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-400 mb-1">Emergency Contact</p>
                  <p className="text-white">
                    {selectedUser.emergencyContact || 'Not set'}
                    {selectedUser.emergencyPhone && ` - ${selectedUser.emergencyPhone}`}
                  </p>
                </div>
                
                {selectedUser.playingStyle && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-400 mb-1">Playing Style</p>
                    <p className="text-white">{selectedUser.playingStyle}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-800">
                {selectedUser.approved ? (
                  <Button
                    onClick={() => handleUnapprove(selectedUser.id, selectedUser.displayName || selectedUser.email)}
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Unapprove Member
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleApprove(selectedUser.id, selectedUser.displayName || selectedUser.email)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve Member
                  </Button>
                )}
                
                <Button
                  onClick={() => handleDeleteAccount(selectedUser.id, selectedUser.displayName || selectedUser.email)}
                  variant="outline"
                  className="border-red-700 text-red-700 hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Account
                </Button>
                
                <Button
                  onClick={() => setViewingProfile(false)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage club members, roles, and approvals</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((userData) => (
                    <TableRow key={userData.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={userData.photoURL} alt={userData.displayName} />
                            <AvatarFallback>{userData.displayName?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{userData.displayName || 'No name'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{userData.email}</TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <Badge variant={userData.role === 'admin' ? 'default' : 'secondary'}>
                          {userData.role || 'member'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">₹{userData.balance || 0}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleViewProfile(userData.id)}
                            variant="outline"
                            size="sm"
                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          
                          <Select
                            value={userData.role || 'member'}
                            onValueChange={(value) => handleRoleChange(userData.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          {userData.approved ? (
                            <Button
                              onClick={() => handleUnapprove(userData.id, userData.displayName || userData.email)}
                              variant="outline"
                              size="sm"
                              className="border-red-600 text-red-600 hover:bg-red-50"
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
                              Approve
                            </Button>
                          )}
                          
                          <Button
                            onClick={() => handleDeleteAccount(userData.id, userData.displayName || userData.email)}
                            variant="outline"
                            size="sm"
                            className="border-red-700 text-red-700 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
