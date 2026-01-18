'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/lib/auth';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import Link from 'next/link';
import PaymentManagement from '@/src/components/admin/PaymentManagement';
import UserManagement from '@/src/components/admin/UserManagement';
import ScheduleManagement from '@/src/components/admin/ScheduleManagement';

export default function AdminPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && mounted) {
      if (!user) {
        router.push('/');
      } else if (userProfile && userProfile.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, userProfile, loading, mounted, router]);

  if (loading || !mounted) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || userProfile?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Access Denied</p>
              <p className="text-sm text-muted-foreground mt-2">
                You don't have permission to access this page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage club operations, users, payments, and schedules
        </p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="py-4">
            <h3 className="font-semibold mb-2">Import Player Balances</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Import all 159 player balances from Excel data
            </p>
            <a href="/admin/import-balances">
              <button className="bg-yellow-400 hover:bg-yellow-500 text-navy-900 px-4 py-2 rounded font-semibold text-sm">
                Go to Import
              </button>
            </a>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 border-red-200">
          <CardContent className="py-4">
            <h3 className="font-semibold mb-2">Manage Admins</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Promote members & generate invite links
            </p>
            <a href="/admin/manage-admins">
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold text-sm">
                Manage Admins
              </button>
            </a>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <h3 className="font-semibold mb-2">User Management</h3>
            <p className="text-sm text-muted-foreground mb-3">
              View all users with advanced filtering
            </p>
            <a href="/admin/users">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold text-sm">
                Manage Users
              </button>
            </a>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-4">
            <h3 className="font-semibold mb-2">Member Registrations</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Approve or reject new member registrations
            </p>
            <a href="/admin/registrations">
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold text-sm">
                View Registrations
              </button>
            </a>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <PaymentManagement />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="schedules">
          <ScheduleManagement />
        </TabsContent>

        <TabsContent value="balances">
          <div className="text-center py-12">
            <p className="text-gray-400 mb-6">Balance management has moved to a dedicated page for better performance</p>
            <Link href="/admin/balance-management">
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-semibold">
                Go to Balance Management
              </button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}