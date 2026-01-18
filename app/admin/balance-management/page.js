'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/lib/auth';
import { getAllWallets, updateWalletBalance } from '@/src/lib/wallet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Wallet, Plus, Minus, Search } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import BackButton from '@/src/components/BackButton';

export default function AdminBalanceManagementPage() {
  const { user, userProfile } = useAuth();
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [transactionType, setTransactionType] = useState('add');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [processing, setProcessing] = useState(false);
  
  const isAdmin = userProfile?.role === 'admin';

  useEffect(() => {
    if (user && isAdmin) {
      fetchWallets();
    }
  }, [user, isAdmin]);

  const fetchWallets = async () => {
    try {
      const data = await getAllWallets(500);
      setWallets(data);
    } catch (error) {
      console.error('Error fetching wallets:', error);
      toast.error('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (wallet, type) => {
    setSelectedWallet(wallet);
    setTransactionType(type);
    setAmount('');
    setDescription('');
    setShowDialog(true);
  };

  const handleTransaction = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setProcessing(true);
    try {
      const amountValue = parseFloat(amount);
      const finalAmount = transactionType === 'add' ? amountValue : -amountValue;

      await updateWalletBalance(
        selectedWallet.id,
        finalAmount,
        transactionType === 'add' ? 'balance_added' : 'balance_deducted',
        description,
        user.uid
      );

      toast.success(`CA$ ${amountValue.toFixed(2)} ${transactionType === 'add' ? 'added to' : 'deducted from'} ${selectedWallet.playerName || 'player'}'s account`);
      setShowDialog(false);
      fetchWallets();
    } catch (error) {
      console.error('Transaction error:', error);
      toast.error('Transaction failed');
    } finally {
      setProcessing(false);
    }
  };

  const filteredWallets = wallets.filter(w =>
    w.playerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 font-montserrat">
            <span className="text-green-400">Balance</span> Management
          </h1>
          <p className="text-gray-400">Manage player account balances</p>
        </div>

        {/* Search */}
        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardContent className="py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Wallets List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWallets.map((wallet) => (
            <Card key={wallet.id} className="bg-gray-900 border-gray-800">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white font-semibold">{wallet.playerName || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{wallet.email}</p>
                  </div>
                  <Wallet className="h-5 w-5 text-yellow-400" />
                </div>
                
                <div className="mb-4">
                  <p className="text-3xl font-bold text-green-400">
                    CA$ {wallet.balance?.toFixed(2) || '0.00'}
                  </p>
                  <Badge className={wallet.balance >= 50 ? 'bg-green-600 mt-2' : 'bg-red-600 mt-2'}>
                    {wallet.balance >= 50 ? 'Can Vote' : 'Cannot Vote'}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleOpenDialog(wallet, 'add')}
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                  <Button
                    onClick={() => handleOpenDialog(wallet, 'deduct')}
                    size="sm"
                    variant="outline"
                    className="flex-1 border-red-600 text-red-400 hover:bg-red-900/20"
                  >
                    <Minus className="h-4 w-4 mr-1" />
                    Deduct
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Transaction Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="bg-gray-900 text-white border-gray-800">
            <DialogHeader>
              <DialogTitle>
                {transactionType === 'add' ? 'Add Money' : 'Deduct Money'}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {selectedWallet?.playerName} - Current: CA$ {selectedWallet?.balance?.toFixed(2)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (CA$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="50.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description/Reason</Label>
                <Textarea
                  id="description"
                  placeholder="E.g., E-transfer received, Court fee for Wednesday"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  rows={3}
                />
              </div>

              {amount && (
                <div className="bg-gray-800 p-3 rounded">
                  <p className="text-sm text-gray-400">New Balance:</p>
                  <p className="text-2xl font-bold text-green-400">
                    CA$ {(selectedWallet?.balance + (transactionType === 'add' ? parseFloat(amount) : -parseFloat(amount))).toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="border-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleTransaction}
                disabled={processing}
                className={transactionType === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {processing ? 'Processing...' : transactionType === 'add' ? 'Add Money' : 'Deduct Money'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
