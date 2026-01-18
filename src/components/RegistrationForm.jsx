'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { toast } from 'sonner';
import { X } from 'lucide-react';

export default function RegistrationForm({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    email: '',
    gender: '',
    skillLevel: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.phone || 
        !formData.email || !formData.gender || !formData.skillLevel) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      // Save registration to Firebase
      await addDoc(collection(db, 'member_registrations'), {
        ...formData,
        fullName: `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`.trim(),
        registeredAt: serverTimestamp(),
        status: 'pending', // Can be: pending, approved, rejected
      });
      
      toast.success('Registration submitted successfully! We will contact you shortly.');
      
      // Reset form
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        phone: '',
        email: '',
        gender: '',
        skillLevel: '',
      });
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error submitting registration:', error);
      toast.error('Failed to submit registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Join LEO Badminton Club</DialogTitle>
              <DialogDescription>
                Fill in your details to become a member. Fields marked with * are required.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>

            {/* Middle Name */}
            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                placeholder="Michael (optional)"
                value={formData.middleName}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (289) 221-4150"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">We'll use this to contact you about sessions</p>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Skill Level */}
            <div className="space-y-2">
              <Label htmlFor="skillLevel">Skill Level *</Label>
              <Select
                value={formData.skillLevel}
                onValueChange={(value) => setFormData({ ...formData, skillLevel: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your skill level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner - Just starting out</SelectItem>
                  <SelectItem value="intermediate">Intermediate - Play regularly</SelectItem>
                  <SelectItem value="advanced">Advanced - Competitive player</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Terms and Conditions */}
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                By submitting this form, you agree to our{' '}
                <a href="/policies" target="_blank" className="text-primary hover:underline">
                  Terms & Conditions
                </a>{' '}
                and{' '}
                <a href="/policies" target="_blank" className="text-primary hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="flex-1 bg-red-500 hover:bg-red-600"
            >
              {loading ? 'Submitting...' : 'Submit Registration'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
