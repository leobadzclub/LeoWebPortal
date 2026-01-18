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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { saveUserProfile } from '@/src/lib/profile';
import { getTermsSummary, TERMS_AND_CONDITIONS } from '@/src/lib/termsAndConditions';
import { toast } from 'sonner';

export default function ProfileCompletionModal({ user, onComplete, onRegistrationSuccess }) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    phoneCountryCode: '+1',
    phoneNumber: '',
    skillLevel: '',
    gender: '',
    emergencyContact: '',
    emergencyPhoneCountryCode: '+1',
    emergencyPhoneNumber: '',
    dateOfBirth: '',
    tshirtSize: '',
    acceptedTerms: false,
  });

  const validateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const validatePhoneNumber = (phone) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    const limitedDigits = digits.slice(0, 10);
    
    if (limitedDigits.length <= 3) {
      return limitedDigits;
    } else if (limitedDigits.length <= 6) {
      return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`;
    } else {
      return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
    }
  };

  const handlePhoneChange = (e, field) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, [field]: formatted });
    // Clear error when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const checkPhoneExists = async (phoneNumber) => {
    try {
      const fullPhone = `${formData.phoneCountryCode} ${phoneNumber}`;
      const profilesQuery = query(
        collection(db, 'profiles'),
        where('phone', '==', fullPhone)
      );
      const snapshot = await getDocs(profilesQuery);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking phone:', error);
      return false;
    }
  };

  const checkEmailExists = async (email) => {
    try {
      const profilesQuery = query(
        collection(db, 'profiles'),
        where('email', '==', email)
      );
      const snapshot = await getDocs(profilesQuery);
      return snapshot.docs.some(doc => doc.id !== user.uid);
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};

    // Validate phone
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be exactly 10 digits';
    }

    // Validate skill level
    if (!formData.skillLevel) {
      newErrors.skillLevel = 'Skill level is required';
    }

    // Validate gender
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    // Validate date of birth
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const age = validateAge(formData.dateOfBirth);
      if (age < 18) {
        newErrors.dateOfBirth = 'You must be 18 years or older to register';
      }
    }

    // Validate terms acceptance
    if (!formData.acceptedTerms) {
      newErrors.acceptedTerms = 'You must accept the Terms and Conditions to register';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      // Check if phone already exists
      const phoneExists = await checkPhoneExists(formData.phoneNumber);
      if (phoneExists) {
        setErrors({ ...errors, phoneNumber: 'This phone number is already registered' });
        toast.error('This phone number is already registered');
        setLoading(false);
        return;
      }

      // Check if email already exists (using Google email)
      const emailExists = await checkEmailExists(user.email);
      if (emailExists) {
        toast.error('This email is already registered with another account');
        setLoading(false);
        return;
      }

      const phone = `${formData.phoneCountryCode} ${formData.phoneNumber}`;
      const emergencyPhone = formData.emergencyPhoneNumber 
        ? `${formData.emergencyPhoneCountryCode} ${formData.emergencyPhoneNumber}` 
        : '';

      // Create user entry in 'users' collection
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        balance: 0,
        role: 'member',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create profile entry in 'profiles' collection
      await saveUserProfile(user.uid, {
        phone,
        emergencyPhone,
        email: user.email,
        skillLevel: formData.skillLevel,
        gender: formData.gender,
        emergencyContact: formData.emergencyContact,
        dateOfBirth: formData.dateOfBirth,
        tshirtSize: formData.tshirtSize,
        displayName: user.displayName,
        photoURL: user.photoURL,
        profileComplete: true,
        approved: false,
        createdAt: new Date(),
      });
      
      toast.success('Registration completed successfully!');
      
      // Call the registration success callback
      if (onRegistrationSuccess) {
        onRegistrationSuccess();
      }
      
      onComplete();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Only skip - don't save anything
    onComplete();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && handleSkip()}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Please provide your information to complete registration.
            All fields marked with * are required to complete your profile.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Phone Number with Country Code */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.phoneCountryCode}
                  onValueChange={(value) => setFormData({ ...formData, phoneCountryCode: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+1">+1 (CA)</SelectItem>
                    <SelectItem value="+91">+91 (IN)</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="XXX-XXX-XXXX"
                  value={formData.phoneNumber}
                  onChange={(e) => handlePhoneChange(e, 'phoneNumber')}
                  required
                  className={`flex-1 ${errors.phoneNumber ? 'border-red-500 border-2' : ''}`}
                  maxLength={12}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-xs text-red-500">{errors.phoneNumber}</p>
              )}
              <p className="text-xs text-gray-500">Format: XXX-XXX-XXXX (10 digits)</p>
            </div>

            {/* Skill Level */}
            <div className="space-y-2">
              <Label htmlFor="skillLevel">Skill Level *</Label>
              <Select
                value={formData.skillLevel}
                onValueChange={(value) => {
                  setFormData({ ...formData, skillLevel: value });
                  if (errors.skillLevel) setErrors({ ...errors, skillLevel: null });
                }}
                required
              >
                <SelectTrigger className={errors.skillLevel ? 'border-red-500 border-2' : ''}>
                  <SelectValue placeholder="Select your skill level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="intermediate+">Intermediate+</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              {errors.skillLevel && (
                <p className="text-xs text-red-500">{errors.skillLevel}</p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => {
                  setFormData({ ...formData, gender: value });
                  if (errors.gender) setErrors({ ...errors, gender: null });
                }}
                required
              >
                <SelectTrigger className={errors.gender ? 'border-red-500 border-2' : ''}>
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-xs text-red-500">{errors.gender}</p>
              )}
            </div>

            {/* Emergency Contact */}
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
              <Input
                id="emergencyContact"
                placeholder="John Doe"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              />
            </div>

            {/* Emergency Phone with Country Code */}
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.emergencyPhoneCountryCode}
                  onValueChange={(value) => setFormData({ ...formData, emergencyPhoneCountryCode: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+1">+1 (CA)</SelectItem>
                    <SelectItem value="+91">+91 (IN)</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  placeholder="XXX-XXX-XXXX"
                  value={formData.emergencyPhoneNumber}
                  onChange={(e) => handlePhoneChange(e, 'emergencyPhoneNumber')}
                  className="flex-1"
                  maxLength={12}
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth (Must be 18+) *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => {
                  setFormData({ ...formData, dateOfBirth: e.target.value });
                  if (errors.dateOfBirth) setErrors({ ...errors, dateOfBirth: null });
                }}
                className={errors.dateOfBirth ? 'border-red-500 border-2' : ''}
                required
              />
              {formData.dateOfBirth && (
                <p className={`text-xs ${validateAge(formData.dateOfBirth) < 18 ? 'text-red-500 font-semibold' : 'text-gray-600'}`}>
                  Age: {validateAge(formData.dateOfBirth)} years {validateAge(formData.dateOfBirth) < 18 ? '(Must be 18+)' : '✓'}
                </p>
              )}
              {errors.dateOfBirth && (
                <p className="text-xs text-red-500">{errors.dateOfBirth}</p>
              )}
            </div>

            {/* T-Shirt Size */}
            <div className="space-y-2">
              <Label htmlFor="tshirtSize">T-Shirt Size (for tournaments)</Label>
              <Select
                value={formData.tshirtSize}
                onValueChange={(value) => setFormData({ ...formData, tshirtSize: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xs">XS</SelectItem>
                  <SelectItem value="s">S</SelectItem>
                  <SelectItem value="m">M</SelectItem>
                  <SelectItem value="l">L</SelectItem>
                  <SelectItem value="xl">XL</SelectItem>
                  <SelectItem value="2xl">2XL</SelectItem>
                  <SelectItem value="3xl">3XL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-3 pt-4 border-t">
              <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 ${errors.acceptedTerms ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}>
                <Checkbox
                  id="terms"
                  checked={formData.acceptedTerms}
                  onCheckedChange={(checked) => {
                    setFormData({ ...formData, acceptedTerms: checked });
                    if (errors.acceptedTerms) setErrors({ ...errors, acceptedTerms: null });
                  }}
                  className={errors.acceptedTerms ? 'border-red-500' : ''}
                />
                <div className="flex-1">
                  <Label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    I accept the{' '}
                    <Sheet>
                      <SheetTrigger asChild>
                        <button type="button" className="text-blue-600 hover:underline font-semibold">
                          Terms and Conditions
                        </button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto bg-gray-900 text-white border-gray-800">
                        <SheetHeader>
                          <SheetTitle className="text-2xl text-white">Terms and Conditions</SheetTitle>
                          <SheetDescription className="text-gray-300">
                            LEO Badminton Club Membership Agreement
                            <br />
                            <span className="text-xs text-gray-400">Last Updated: {TERMS_AND_CONDITIONS.lastUpdated}</span>
                          </SheetDescription>
                        </SheetHeader>
                        
                        <div className="mt-6 space-y-6">
                          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                            <p className="text-sm text-blue-200 leading-relaxed">
                              Please read these Terms and Conditions carefully before registering. 
                              By accepting, you agree to be bound by these terms.
                            </p>
                          </div>
                          
                          {TERMS_AND_CONDITIONS.sections.map((section, index) => (
                            <div key={index} className="border-b border-gray-700 pb-4">
                              <h3 className="font-bold text-lg mb-3 text-yellow-400">{section.heading}</h3>
                              <p className="text-sm text-gray-200 leading-relaxed">
                                {section.content}
                              </p>
                            </div>
                          ))}
                          
                          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mt-6">
                            <p className="text-sm text-center text-blue-200">
                              <strong className="text-white">Questions?</strong> Contact us at{' '}
                              <a href="mailto:leosportzclub@gmail.com" className="text-yellow-400 hover:underline font-semibold">
                                leosportzclub@gmail.com
                              </a>
                            </p>
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                    {' *'}
                  </Label>
                  <p className="text-xs text-gray-600 mt-2">
                    {getTermsSummary()}
                  </p>
                </div>
              </div>
              {errors.acceptedTerms && (
                <p className="text-xs text-red-500 font-semibold">{errors.acceptedTerms}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <div className="flex gap-2 w-full">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSkip}
                className="flex-1"
              >
                Skip for Now
              </Button>
              <Button 
                type="submit" 
                disabled={loading} 
                className="flex-1"
              >
                {loading ? 'Saving...' : 'Complete Registration'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
