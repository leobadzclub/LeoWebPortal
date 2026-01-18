'use client';

import { useState } from 'react';
import { useAuth } from '@/src/lib/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Shield, CheckCircle } from 'lucide-react';

export default function SetupAdminPage() {
  const { user } = useAuth();
  const [setting, setSetting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleSetAdmin = async () => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    setSetting(true);
    try {
      // Set user as admin in profiles collection with auto-approval
      const profileRef = doc(db, 'profiles', user.uid);
      await setDoc(profileRef, {
        role: 'admin',
        approved: true, // Auto-approve admins
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        updatedAt: new Date(),
      }, { merge: true });

      // Also create/update in users collection for Firestore rules
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        role: 'admin',
        approved: true, // Auto-approve admins
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        updatedAt: new Date(),
      }, { merge: true });

      setIsAdmin(true);
      toast.success('Successfully set as Super Admin and auto-approved! Please refresh the page.');
    } catch (error) {
      console.error('Error setting admin:', error);
      toast.error(`Failed to set admin: ${error.message}`);
    } finally {
      setSetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg mb-4 mx-auto">
                <Shield className="h-10 w-10 text-navy-900" />
              </div>
              <CardTitle className="text-3xl text-white">
                Setup Super Admin
              </CardTitle>
              <CardDescription className="text-gray-400">
                Grant yourself admin privileges for LEO Badminton Club
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {user ? (
                <>
                  <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-gray-400">Current User:</p>
                    <p className="text-white font-medium">{user.displayName}</p>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>

                  {!isAdmin ? (
                    <div className="space-y-4">
                      <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                        <p className="text-yellow-400 text-sm">
                          ⚠️ This will grant you full admin access including:
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-gray-300 list-disc list-inside">
                          <li>Access to admin dashboard</li>
                          <li>Approve/reject member registrations</li>
                          <li>Manage all user profiles</li>
                          <li>Full system access</li>
                        </ul>
                      </div>

                      <Button
                        onClick={handleSetAdmin}
                        disabled={setting}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-navy-900 font-semibold"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        {setting ? 'Setting Admin...' : 'Set Me as Super Admin'}
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-green-900/20 border border-green-700 rounded-lg p-6 text-center">
                      <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                      <p className="text-green-400 font-semibold text-lg">
                        Successfully Set as Admin!
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        Please refresh the page or navigate to the admin panel
                      </p>
                      <Button
                        onClick={() => window.location.href = '/admin/registrations'}
                        className="mt-4 bg-green-600 hover:bg-green-700"
                      >
                        Go to Admin Dashboard
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">Please sign in to continue</p>
                  <Button
                    onClick={() => window.location.href = '/'}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Go to Home & Sign In
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Once you're set as admin, you can access the admin panel at{' '}
              <code className="text-yellow-400">/admin/registrations</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
