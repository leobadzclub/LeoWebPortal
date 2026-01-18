'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/lib/auth';
import { collection, getDocs, doc, updateDoc, setDoc, query, where, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Shield, UserPlus, Copy, CheckCircle, XCircle, Link as LinkIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import BackButton from '@/src/components/BackButton';

export default function ManageAdminsPage() {
  const { user, userProfile } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [members, setMembers] = useState([]);
  const [inviteLinks, setInviteLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingLink, setGeneratingLink] = useState(false);
  
  const isAdmin = userProfile?.role === 'admin';

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const fetchData = async () => {
    try {
      // Fetch all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const profilesSnapshot = await getDocs(collection(db, 'profiles'));
      
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
      
      const allUsers = Array.from(usersMap.values());
      
      // Separate admins and members
      const adminList = allUsers.filter(u => u.role === 'admin');
      const memberList = allUsers.filter(u => u.role !== 'admin');
      
      setAdmins(adminList);
      setMembers(memberList);
      
      // Fetch invite links
      const linksSnapshot = await getDocs(collection(db, 'admin_invites'));
      setInviteLinks(linksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToAdmin = async (userId, userName) => {
    try {
      // Update users collection
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { 
        role: 'admin',
        updatedAt: new Date(),
      });
      
      // Update profiles collection with auto-approval
      const profileRef = doc(db, 'profiles', userId);
      await updateDoc(profileRef, { 
        role: 'admin',
        approved: true, // Auto-approve admins
        updatedAt: new Date(),
      });

      toast.success(`${userName} promoted to Admin!`);
      fetchData();
    } catch (error) {
      console.error('Error promoting user:', error);
      toast.error(`Failed to promote: ${error.message}`);
    }
  };

  const handleDemoteFromAdmin = async (userId, userName) => {
    if (userId === user.uid) {
      toast.error('You cannot demote yourself!');
      return;
    }
    
    if (!confirm(`Are you sure you want to remove admin access from ${userName}?`)) return;
    
    try {
      // Update users collection
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { 
        role: 'member',
        updatedAt: new Date(),
      });
      
      // Update profiles collection
      const profileRef = doc(db, 'profiles', userId);
      await updateDoc(profileRef, { 
        role: 'member',
        updatedAt: new Date(),
      });

      toast.success(`${userName} demoted to Member`);
      fetchData();
    } catch (error) {
      console.error('Error demoting user:', error);
      toast.error(`Failed to demote: ${error.message}`);
    }
  };

  const handleGenerateInviteLink = async () => {
    setGeneratingLink(true);
    try {
      const inviteCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      await addDoc(collection(db, 'admin_invites'), {
        code: inviteCode,
        createdBy: user.uid,
        createdByName: user.displayName,
        createdAt: new Date(),
        used: false,
      });

      toast.success('Invite link generated!');
      fetchData();
    } catch (error) {
      console.error('Error generating invite:', error);
      toast.error('Failed to generate invite link');
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleCopyInviteLink = (code) => {
    const baseUrl = window.location.origin;
    const inviteUrl = `${baseUrl}/admin-invite/${code}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success('Invite link copied to clipboard!');
  };

  const handleDeleteInviteLink = async (inviteId) => {
    if (!confirm('Delete this invite link?')) return;
    
    try {
      await deleteDoc(doc(db, 'admin_invites', inviteId));
      toast.success('Invite link deleted');
      fetchData();
    } catch (error) {
      console.error('Error deleting invite:', error);
      toast.error('Failed to delete invite link');
    }
  };

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
          <p className="text-gray-400">Loading admin management...</p>
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
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Shield className="h-10 w-10 text-yellow-400" />
            <span className="text-yellow-400">Admin</span> Management
          </h1>
          <p className="text-gray-400">Manage administrators and generate invite links</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl">
          {/* Current Admins */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-yellow-400" />
                Current Admins ({admins.length})
              </CardTitle>
              <CardDescription className="text-gray-400">
                Users with admin privileges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-semibold">{admin.displayName || 'No name'}</p>
                      <p className="text-sm text-gray-400">{admin.email}</p>
                      {admin.id === user.uid && (
                        <Badge className="mt-1 bg-blue-600">You</Badge>
                      )}
                    </div>
                    
                    {admin.id !== user.uid && (
                      <Button
                        onClick={() => handleDemoteFromAdmin(admin.id, admin.displayName || admin.email)}
                        variant="outline"
                        size="sm"
                        className="border-red-600 text-red-400 hover:bg-red-900/20"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                
                {admins.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No admins found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Promote Members to Admin */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-green-400" />
                Promote Members
              </CardTitle>
              <CardDescription className="text-gray-400">
                Grant admin access to existing members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {members.slice(0, 10).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-semibold">{member.displayName || 'No name'}</p>
                      <p className="text-sm text-gray-400">{member.email}</p>
                    </div>
                    
                    <Button
                      onClick={() => handlePromoteToAdmin(member.id, member.displayName || member.email)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      Make Admin
                    </Button>
                  </div>
                ))}
                
                {members.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No members to promote</p>
                )}
                
                {members.length > 10 && (
                  <p className="text-center text-sm text-gray-500 pt-4">
                    Showing first 10 members. Use Users tab to see all.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invite Links Section */}
        <div className="mt-8 max-w-7xl">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-yellow-400" />
                    Admin Invite Links
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Generate invite links for new admins
                  </CardDescription>
                </div>
                <Button
                  onClick={handleGenerateInviteLink}
                  disabled={generatingLink}
                  className="bg-yellow-400 hover:bg-yellow-500 text-navy-900"
                >
                  {generatingLink ? 'Generating...' : 'Generate New Link'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {inviteLinks.length > 0 ? (
                <div className="space-y-3">
                  {inviteLinks.map((invite) => {
                    const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/admin-invite/${invite.code}`;
                    
                    return (
                      <div
                        key={invite.id}
                        className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-white font-mono text-sm bg-gray-700 px-3 py-1 rounded">
                              {invite.code}
                            </p>
                            {invite.used ? (
                              <Badge className="bg-gray-600">Used</Badge>
                            ) : (
                              <Badge className="bg-green-600">Active</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">
                            Created by {invite.createdByName} on {invite.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleCopyInviteLink(invite.code)}
                            variant="outline"
                            size="sm"
                            className="border-gray-700"
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy Link
                          </Button>
                          
                          {!invite.used && (
                            <Button
                              onClick={() => handleDeleteInviteLink(invite.id)}
                              variant="outline"
                              size="sm"
                              className="border-red-600 text-red-400 hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <LinkIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">No invite links generated yet</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Click "Generate New Link" to create an invite link for a new admin
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions Card */}
          <Card className="bg-blue-900/20 border-blue-700 mt-6">
            <CardContent className="py-4">
              <h3 className="text-blue-400 font-semibold mb-2">How to Use Invite Links:</h3>
              <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                <li>Click "Generate New Link" to create an invite</li>
                <li>Click "Copy Link" to copy the invite URL</li>
                <li>Share the link with the person you want to make admin</li>
                <li>They click the link and sign in with Google</li>
                <li>They're automatically granted admin access!</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
