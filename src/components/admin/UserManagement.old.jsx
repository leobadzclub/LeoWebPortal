'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
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
  DialogTrigger,
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
import { Users, CheckCircle, XCircle, Clock, Eye, Mail, Phone, Calendar, Shield } from 'lucide-react';
import { toast } from 'sonner';

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
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const profilesSnapshot = await getDocs(collection(db, 'profiles'));
      
      // Merge users and profiles data
      const usersMap = new Map();
      
      usersSnapshot.docs.forEach(doc => {
        usersMap.set(doc.id, { id: doc.id, ...doc.data() });
      });
      
      profilesSnapshot.docs.forEach(doc => {
        const existing = usersMap.get(doc.id);
        if (existing) {
          usersMap.set(doc.id, { ...existing, ...doc.data() });
        } else {
          usersMap.set(doc.id, { id: doc.id, ...doc.data() });
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
      // Fetch full profile data
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
      await updateDoc(profileRef, {
        approved: true,
        updatedAt: new Date(),
      });

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
      await updateDoc(profileRef, {
        approved: false,
        updatedAt: new Date(),
      });

      toast.success(`${userName} unapproved`);
      setViewingProfile(false);
      fetchUsers();
    } catch (error) {
      console.error('Error unapproving user:', error);
      toast.error(`Failed to unapprove user: ${error.message}`);
    }
  };

  return (
    <>
      {/* Profile Preview Dialog */}
      <Dialog open={viewingProfile} onOpenChange={setViewingProfile}>
        <DialogContent className="max-w-2xl bg-gray-900 text-white border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedUser?.photoURL} alt={selectedUser?.displayName} />
                <AvatarFallback>{selectedUser?.displayName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              {selectedUser?.displayName || 'User Profile'}
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
                  <p className="text-white capitalize">{selectedUser.skillLevel || 'Not set'}</p>
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
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.photoURL} alt={user.displayName} />
                          <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.displayName || 'No name'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      {user.approved ? (
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
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role || 'member'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">₹{user.balance || 0}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleViewProfile(user.id)}
                          variant="outline"
                          size="sm"
                          className="border-blue-600 text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        <Select
                          value={user.role || 'member'}
                          onValueChange={(value) => handleRoleChange(user.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {user.approved ? (
                          <Button
                            onClick={() => handleUnapprove(user.id, user.displayName || user.email)}
                            variant="outline"
                            size="sm"
                            className="border-red-600 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Unapprove
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleApprove(user.id, user.displayName || user.email)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
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
