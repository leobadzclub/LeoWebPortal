'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/lib/auth';
import { getPlayerWallet, getWalletTransactions } from '@/src/lib/wallet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, Mail, Phone, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import BackButton from '@/src/components/BackButton';
import { format } from 'date-fns';

export default function MyBalancePage() {
  const { user, extendedProfile } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [user]);

  const fetchWalletData = async () => {
    try {
      const walletData = await getPlayerWallet(user.uid);
      setWallet(walletData);
      
      const txData = await getWalletTransactions(user.uid, 20);
      setTransactions(txData);
    } catch (error) {
      console.error('Error fetching wallet:', error);
      toast.error('Failed to load balance');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Please Sign In</h1>
          <Link href="/">
            <button className="bg-yellow-400 hover:bg-yellow-500 text-navy-900 px-6 py-3 rounded font-semibold">
              Go to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-lg mb-4">
            <Wallet className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 font-montserrat">
            My <span className="text-green-400">Balance</span>
          </h1>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Current Balance */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-gray-400 mb-2">Current Balance</p>
                <p className="text-6xl font-bold text-green-400 mb-4">
                  CA$ {wallet?.balance?.toFixed(2) || '0.00'}
                </p>
                <Badge className={wallet?.balance >= 50 ? 'bg-green-600' : 'bg-red-600'}>
                  {wallet?.balance >= 50 ? 'Eligible to Vote' : 'Insufficient for Voting (CA$ 50 required)'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Add Money Instructions */}
          <Card className="bg-blue-900/20 border-blue-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                How to Add Money
              </CardTitle>
              <CardDescription className="text-gray-300">
                Send e-transfer to add funds to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-3">Step 1: Send E-Transfer</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-yellow-400" />
                    <span className="text-gray-300">Email: </span>
                    <span className="text-white font-mono">leosportzclub@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-yellow-400" />
                    <span className="text-gray-300">Contact: </span>
                    <span className="text-white">+1 (289) 221-4150</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-2">Step 2: Notify Admin</h3>
                <p className="text-gray-300 text-sm">
                  After sending the e-transfer, notify the club admin via WhatsApp or email with:
                </p>
                <ul className="list-disc list-inside text-gray-400 text-sm mt-2 space-y-1">
                  <li>Your name: {user.displayName}</li>
                  <li>Amount sent</li>
                  <li>Transaction reference number</li>
                </ul>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-2">Step 3: Balance Updated</h3>
                <p className="text-gray-300 text-sm">
                  Admin will update your balance within 24 hours. You'll receive a confirmation.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Transaction History</CardTitle>
              <CardDescription className="text-gray-400">
                Your recent balance changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-white font-semibold">{tx.description || tx.type}</p>
                        <p className="text-xs text-gray-400">
                          {tx.createdAt?.toDate ? format(tx.createdAt.toDate(), 'MMM d, yyyy h:mm a') : 'Unknown date'}
                        </p>
                      </div>
                      <div className={`text-lg font-bold ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.amount >= 0 ? '+' : ''}CA$ {tx.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">No transactions yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
