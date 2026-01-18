'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/src/lib/auth';
import { collection, query, where, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AdminInvitePage() {
  const params = useParams();
  const router = useRouter();
  const { user, signInWithGoogle } = useAuth();
  const [inviteCode] = useState(params.code);
  const [inviteData, setInviteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (inviteCode) {
      verifyInviteCode();
    }
  }, [inviteCode]);

  useEffect(() => {
    if (user && inviteData && !inviteData.used && !success) {
      acceptInvite();
    }
  }, [user, inviteData]);

  const verifyInviteCode = async () => {
    try {
      const invitesQuery = query(
        collection(db, 'admin_invites'),
        where('code', '==', inviteCode)
      );
      
      const snapshot = await getDocs(invitesQuery);
      
      if (snapshot.empty) {
        toast.error('Invalid invite link');
        setInviteData(null);
      } else {
        const invite = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        setInviteData(invite);
        
        if (invite.used) {
          toast.error('This invite link has already been used');
        }
      }
    } catch (error) {
      console.error('Error verifying invite:', error);
      toast.error('Failed to verify invite link');
    } finally {
      setLoading(false);
    }
  };

  const acceptInvite = async () => {
    if (!user || !inviteData || inviteData.used) return;
    
    setProcessing(true);
    try {
      // Set user as admin in profiles collection
      const profileRef = doc(db, 'profiles', user.uid);
      await setDoc(profileRef, {
        role: 'admin',
        approved: true, // Auto-approve admins
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        updatedAt: new Date(),
      }, { merge: true });

      // Set user as admin in users collection
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        role: 'admin',
        approved: true,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        updatedAt: new Date(),
      }, { merge: true });

      // Mark invite as used
      const inviteRef = doc(db, 'admin_invites', inviteData.id);
      await updateDoc(inviteRef, {
        used: true,
        usedBy: user.uid,
        usedByName: user.displayName,
        usedAt: new Date(),
      });

      setSuccess(true);
      toast.success('Welcome! You are now an admin!');
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/admin');
      }, 3000);
    } catch (error) {
      console.error('Error accepting invite:', error);
      toast.error(`Failed to accept invite: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent mb-4"></div>
          <p className="text-gray-400">Verifying invite...</p>
        </div>
      </div>
    );
  }

  if (!inviteData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Invalid Invite</h1>
          <p className="text-gray-400 mb-8">
            This admin invite link is invalid or has expired.
          </p>
          <Link href="/">
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-navy-900">
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (inviteData.used && !success) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Invite Already Used</h1>
          <p className="text-gray-400 mb-8">
            This admin invite link has already been used by {inviteData.usedByName || 'another user'}.
          </p>
          <Link href="/">
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-navy-900">
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Welcome, Admin!</h1>
          <p className="text-gray-400 mb-4">
            You've been successfully granted admin access to LEO Badminton Club.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Redirecting to admin dashboard...
          </p>
          <Link href="/admin">
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-navy-900">
              Go to Admin Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg mb-4 mx-auto">
                <Shield className="h-10 w-10 text-navy-900" />
              </div>
              <CardTitle className="text-white text-center">Admin Invite</CardTitle>
              <CardDescription className="text-gray-400 text-center">
                You've been invited to become an admin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <p className="text-blue-400 text-sm">
                  ℹ️ This invite link was created by <strong>{inviteData.createdByName}</strong>
                </p>
              </div>
              
              <Button
                onClick={signInWithGoogle}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-navy-900 font-semibold"
              >
                Sign In to Accept Invite
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent mb-4"></div>
          <p className="text-gray-400">Setting up admin access...</p>
        </div>
      </div>
    );
  }

  return null;
}
