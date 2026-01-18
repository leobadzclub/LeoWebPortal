'use client';

import { useState } from 'react';
import { useAuth } from '@/src/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CheckCircle, UserCheck } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import Link from 'next/link';

export default function SelfApprovePage() {
  const { user, userProfile } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [approved, setApproved] = useState(false);

  const handleApprove = async () => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    setProcessing(true);
    try {
      // Update profile to approved
      const profileRef = doc(db, 'profiles', user.uid);
      await updateDoc(profileRef, {
        approved: true,
        updatedAt: new Date(),
      });

      setApproved(true);
      toast.success('Profile approved! Please refresh or sign out and sign in again.');
    } catch (error) {
      console.error('Error approving profile:', error);
      toast.error(`Failed to approve: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-400 mb-8">You need to be logged in.</p>
          <Link href="/">
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-navy-900">Go to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <UserCheck className="h-8 w-8 text-yellow-400" />
                <div>
                  <CardTitle className="text-2xl text-white">Approve Your Profile</CardTitle>
                  <CardDescription className="text-gray-400">
                    Quick self-approval for admins
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {!approved ? (
                <>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-white font-semibold mb-2">Current Status:</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Name:</span>
                        <span className="text-white">{user.displayName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span className="text-white">{user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Role:</span>
                        <span className="text-yellow-400">{userProfile?.role || 'member'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Approved:</span>
                        <span className={userProfile?.approved ? "text-green-400" : "text-red-400"}>
                          {userProfile?.approved ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                    <p className="text-blue-400 text-sm">
                      ℹ️ Click the button below to approve your profile and gain access to all member features including Weekly Schedule voting.
                    </p>
                  </div>

                  <Button
                    onClick={handleApprove}
                    disabled={processing}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-navy-900 font-semibold h-12"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-navy-900 border-t-transparent mr-2"></div>
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Approve My Profile
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Profile Approved!</h3>
                  <p className="text-gray-400 mb-6">
                    Your profile has been approved successfully.
                  </p>

                  <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mb-6">
                    <p className="text-yellow-400 text-sm">
                      ⚠️ <strong>Important:</strong> Please sign out and sign in again for the changes to take effect.
                    </p>
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => window.location.href = '/'}
                      className="bg-yellow-400 hover:bg-yellow-500 text-navy-900"
                    >
                      Go to Home
                    </Button>
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                      className="border-gray-700"
                    >
                      Refresh Page
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
