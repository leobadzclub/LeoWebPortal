'use client';

import { useState } from 'react';
import { useAuth } from '@/src/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ShieldCheck, CheckCircle } from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import Link from 'next/link';

export default function ApproveAdminsPage() {
  const { user, userProfile } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  
  const isAdmin = userProfile?.role === 'admin';

  const handleApproveAdmins = async () => {
    if (!user || !isAdmin) {
      toast.error('Admin access required');
      return;
    }

    setProcessing(true);
    try {
      // Find all users with admin role
      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'admin')
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      const adminUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      toast.info(`Found ${adminUsers.length} admin(s). Approving...`);

      let approvedCount = 0;
      const approvedAdmins = [];

      for (const admin of adminUsers) {
        try {
          // Update profiles collection
          const profileRef = doc(db, 'profiles', admin.id);
          await updateDoc(profileRef, {
            approved: true,
            updatedAt: new Date(),
          });

          approvedCount++;
          approvedAdmins.push(admin.displayName || admin.email);
        } catch (error) {
          console.error(`Error approving admin ${admin.id}:`, error);
        }
      }

      setResults({
        total: adminUsers.length,
        approved: approvedCount,
        admins: approvedAdmins,
      });

      toast.success(`Auto-approved ${approvedCount} admin(s)!`);
    } catch (error) {
      console.error('Error approving admins:', error);
      toast.error(`Failed to approve admins: ${error.message}`);
    } finally {
      setProcessing(false);
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

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-8 w-8 text-yellow-400" />
                <div>
                  <CardTitle className="text-2xl text-white">Auto-Approve All Admins</CardTitle>
                  <CardDescription className="text-gray-400">
                    Automatically approve all users with admin role
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {!results ? (
                <>
                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                    <p className="text-blue-400 text-sm mb-2">
                      ℹ️ <strong>What this does:</strong>
                    </p>
                    <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                      <li>Finds all users with admin role</li>
                      <li>Sets their profile as approved</li>
                      <li>Gives them access to member features</li>
                      <li>Including Weekly Schedule voting</li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleApproveAdmins}
                    disabled={processing}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-navy-900 font-semibold h-12"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-navy-900 border-t-transparent mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-5 w-5 mr-2" />
                        Auto-Approve All Admins
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Admins Approved!</h3>
                  <p className="text-gray-400 mb-6">
                    {results.approved} out of {results.total} admin(s) approved
                  </p>

                  <div className="bg-gray-800 rounded-lg p-4 mb-6">
                    <h4 className="text-white font-semibold mb-2">Approved Admins:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {results.admins.map((name, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <Link href="/weekly-schedule">
                      <Button className="bg-yellow-400 hover:bg-yellow-500 text-navy-900">
                        Go to Weekly Schedule
                      </Button>
                    </Link>
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
