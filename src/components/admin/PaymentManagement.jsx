'use client';

import { useEffect, useState } from 'react';
import { getPayments, createPayment, getAllUsers, updateUser } from '@/src/lib/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    type: 'credit',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsData, usersData] = await Promise.all([
        getPayments(),
        getAllUsers()
      ]);
      setPayments(paymentsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.amount) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const user = users.find(u => u.id === formData.userId);
      const amount = parseFloat(formData.amount);
      const newBalance = formData.type === 'credit' 
        ? (user.balance || 0) + amount
        : (user.balance || 0) - amount;

      // Create payment record
      await createPayment({
        userId: formData.userId,
        userName: user.displayName,
        amount: amount,
        type: formData.type,
        description: formData.description,
        balance: newBalance
      });

      // Update user balance
      await updateUser(formData.userId, { balance: newBalance });

      toast.success('Payment recorded successfully');
      setDialogOpen(false);
      setFormData({ userId: '', amount: '', type: 'credit', description: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Failed to record payment');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payment Management</CardTitle>
            <CardDescription>Track and manage member payments and balances</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
                <DialogDescription>
                  Add a new payment transaction for a member
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="userId">Member</Label>
                  <Select value={formData.userId} onValueChange={(value) => setFormData({...formData, userId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.displayName} (₹{user.balance || 0})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit">Credit (+)</SelectItem>
                      <SelectItem value="debit">Debit (-)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="e.g., Tournament fee, Monthly dues"
                  />
                </div>
                <Button type="submit" className="w-full">Record Payment</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No payment records yet. Click "Add Payment" to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => {
                  const paymentDate = payment.createdAt?.toDate ? payment.createdAt.toDate() : new Date();
                  
                  return (
                    <TableRow key={payment.id}>
                      <TableCell>{format(paymentDate, 'PP')}</TableCell>
                      <TableCell className="font-medium">{payment.userName}</TableCell>
                      <TableCell>
                        <span className={`capitalize ${payment.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {payment.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {payment.type === 'credit' ? '+' : '-'}₹{payment.amount}
                      </TableCell>
                      <TableCell className="text-right">₹{payment.balance}</TableCell>
                      <TableCell className="text-muted-foreground">{payment.description}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}