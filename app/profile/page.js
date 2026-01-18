'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/lib/auth';
import { getUserProfile, saveUserProfile } from '@/src/lib/profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { User, Mail, Phone, Calendar, Edit, Save, X, CheckCircle, Clock, Upload, Trophy, Target, Zap, Award, Star } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/src/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import BackButton from '@/src/components/BackButton';
import { getSkillLevelColors } from '@/src/lib/skillLevelColors';

export default function ProfilePage() {
  const { user, extendedProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
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
    preferredPlayingTimes: [],
    equipmentPreferences: {
      hasRacket: false,
      racketBrand: '',
      hasShoes: false,
      needsShuttlecocks: false,
    },
    playingStyle: '',
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const profileData = await getUserProfile(user.uid);
      setProfile(profileData);
      if (profileData) {
        // Parse phone number to separate country code and number
        let phoneCountryCode = '+1';
        let phoneNumber = '';
        if (profileData.phone) {
          const match = profileData.phone.match(/^(\+\d{1,4})\s?(.+)$/);
          if (match) {
            phoneCountryCode = match[1];
            phoneNumber = match[2];
          } else {
            phoneNumber = profileData.phone;
          }
        }
        
        // Parse emergency phone
        let emergencyPhoneCountryCode = '+1';
        let emergencyPhoneNumber = '';
        if (profileData.emergencyPhone) {
          const match = profileData.emergencyPhone.match(/^(\+\d{1,4})\s?(.+)$/);
          if (match) {
            emergencyPhoneCountryCode = match[1];
            emergencyPhoneNumber = match[2];
          } else {
            emergencyPhoneNumber = profileData.emergencyPhone;
          }
        }
        
        setFormData({
          phoneCountryCode,
          phoneNumber,
          skillLevel: profileData.skillLevel || '',
          gender: profileData.gender || '',
          emergencyContact: profileData.emergencyContact || '',
          emergencyPhoneCountryCode,
          emergencyPhoneNumber,
          dateOfBirth: profileData.dateOfBirth || '',
          tshirtSize: profileData.tshirtSize || '',
          preferredPlayingTimes: profileData.preferredPlayingTimes || [],
          equipmentPreferences: profileData.equipmentPreferences || {
            hasRacket: false,
            racketBrand: '',
            hasShoes: false,
            needsShuttlecocks: false,
          },
          playingStyle: profileData.playingStyle || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchWinLossStats = async () => {
    try {
      // Fetch all matches where user participated
      const matchesRef = collection(db, 'matches');
      const q = query(matchesRef, where('playerIds', 'array-contains', user.uid));
      const snapshot = await getDocs(q);
      
      let wins = 0;
      let losses = 0;
      
      snapshot.docs.forEach(doc => {
        const match = doc.data();
        if (match.winnerId === user.uid) {
          wins++;
        } else {
          losses++;
        }
      });
      
      return { wins, losses, totalMatches: wins + losses };
    } catch (error) {
      console.error('Error fetching win/loss stats:', error);
      return { wins: 0, losses: 0, totalMatches: 0 };
    }
  };

  const calculateAchievements = (stats, profile) => {
    const achievements = [];
    
    // Match-based achievements
    if (stats.totalMatches >= 1) achievements.push({ icon: '🏸', name: 'First Match', desc: 'Played your first match' });
    if (stats.totalMatches >= 10) achievements.push({ icon: '🎯', name: 'Regular Player', desc: 'Played 10 matches' });
    if (stats.totalMatches >= 50) achievements.push({ icon: '⚡', name: 'Dedicated', desc: 'Played 50 matches' });
    if (stats.totalMatches >= 100) achievements.push({ icon: '👑', name: 'Legend', desc: 'Played 100 matches' });
    
    // Win-based achievements
    if (stats.wins >= 5) achievements.push({ icon: '🥉', name: 'Bronze Winner', desc: '5 wins' });
    if (stats.wins >= 10) achievements.push({ icon: '🥈', name: 'Silver Winner', desc: '10 wins' });
    if (stats.wins >= 25) achievements.push({ icon: '🥇', name: 'Gold Winner', desc: '25 wins' });
    if (stats.wins >= 50) achievements.push({ icon: '💎', name: 'Diamond Champion', desc: '50 wins' });
    
    // Win streak achievements
    const winRate = stats.totalMatches > 0 ? (stats.wins / stats.totalMatches) * 100 : 0;
    if (winRate >= 60 && stats.totalMatches >= 10) achievements.push({ icon: '🔥', name: 'Hot Streak', desc: '60% win rate' });
    if (winRate >= 75 && stats.totalMatches >= 20) achievements.push({ icon: '⭐', name: 'Superstar', desc: '75% win rate' });
    
    // Profile completion
    if (profile?.profileComplete) achievements.push({ icon: '✅', name: 'Profile Complete', desc: 'Completed profile' });
    
    return achievements;
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const storageRef = ref(storage, `profile-photos/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      
      // Update profile with new photo URL
      await saveUserProfile(user.uid, {
        ...formData,
        photoURL,
        email: user.email,
        displayName: user.displayName,
        profileComplete: true,
      });
      
      toast.success('Profile photo updated!');
      fetchProfile();
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!formData.phoneNumber || !formData.skillLevel || !formData.gender) {
      toast.error('Phone, skill level, and gender are required');
      return;
    }

    setSaving(true);
    try {
      // Combine country code and phone number for storage
      const phone = `${formData.phoneCountryCode} ${formData.phoneNumber}`;
      const emergencyPhone = formData.emergencyPhoneNumber 
        ? `${formData.emergencyPhoneCountryCode} ${formData.emergencyPhoneNumber}` 
        : '';

      await saveUserProfile(user.uid, {
        phone,
        emergencyPhone,
        skillLevel: formData.skillLevel,
        gender: formData.gender,
        emergencyContact: formData.emergencyContact,
        dateOfBirth: formData.dateOfBirth,
        tshirtSize: formData.tshirtSize,
        preferredPlayingTimes: formData.preferredPlayingTimes,
        equipmentPreferences: formData.equipmentPreferences,
        playingStyle: formData.playingStyle,
        email: user.email,
        displayName: user.displayName,
        photoURL: profile?.photoURL || user.photoURL,
        profileComplete: true,
      });
      
      toast.success('Profile updated successfully!');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      console.error('Error details:', error.message, error.code);
      toast.error(`Failed to update profile: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const [stats, setStats] = useState({ wins: 0, losses: 0, totalMatches: 0 });
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    if (user && profile) {
      fetchWinLossStats().then(statsData => {
        setStats(statsData);
        setAchievements(calculateAchievements(statsData, profile));
      });
    }
  }, [user, profile]);

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-400 mb-8">You need to be logged in to view your profile.</p>
          <Link href="/">
            <Button className="bg-red-500 hover:bg-red-600">Go to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-500 shadow-lg mb-4">
            <User className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4">
            My <span className="text-red-500">Profile</span>
          </h1>
          <p className="text-xl text-gray-300">
            Manage your account information and preferences
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-400">Loading profile...</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Profile Header Card */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-yellow-400 shadow-lg">
                      <AvatarImage src={profile?.photoURL || user.photoURL} alt={user.displayName} />
                      <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-navy-900 text-2xl font-bold">
                        {user.displayName?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {editing && (
                      <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-yellow-400 hover:bg-yellow-500 text-navy-900 rounded-full p-2 cursor-pointer shadow-lg transition-all">
                        <Upload className="h-4 w-4" />
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          disabled={uploadingPhoto}
                        />
                      </label>
                    )}
                    {uploadingPhoto && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-yellow-400 border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-bold text-white mb-2">{user.displayName}</h2>
                    <div className="flex flex-col md:flex-row items-center md:items-center gap-3 text-gray-400">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{user.email}</span>
                      </div>
                      {profile?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{profile.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                      {profile?.skillLevel && (
                        <Badge className={getSkillLevelColors(profile.skillLevel).bg + ' ' + getSkillLevelColors(profile.skillLevel).text + ' border-2 ' + getSkillLevelColors(profile.skillLevel).border}>
                          {getSkillLevelColors(profile.skillLevel).label}
                        </Badge>
                      )}
                      {!profile?.profileComplete ? (
                        <Badge className="bg-gray-500 text-white">
                          <Clock className="h-3 w-3 mr-1" />
                          Not Registered
                        </Badge>
                      ) : extendedProfile?.approved ? (
                        <Badge className="bg-green-500 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approved Member
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-500 text-black">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending Approval
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {!editing && (
                    <Button 
                      onClick={() => setEditing(true)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Profile Details Card */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-white">Personal Information</CardTitle>
                    <CardDescription className="text-gray-400">
                      {editing ? 'Update your personal details' : 'Your account information'}
                    </CardDescription>
                  </div>
                  {editing && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setEditing(false);
                          fetchProfile();
                        }}
                        className="border-gray-700"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <div className="space-y-4">
                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white">Phone Number *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="phoneCountryCode"
                          type="text"
                          value={formData.phoneCountryCode}
                          onChange={(e) => setFormData({ ...formData, phoneCountryCode: e.target.value })}
                          className="bg-gray-800 border-gray-700 text-white w-24"
                          placeholder="+1"
                        />
                        <Input
                          id="phoneNumber"
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                          className="bg-gray-800 border-gray-700 text-white flex-1"
                          placeholder="Phone number"
                          required
                        />
                      </div>
                    </div>

                    {/* Skill Level */}
                    <div className="space-y-2">
                      <Label htmlFor="skillLevel" className="text-white">Skill Level *</Label>
                      <Select
                        value={formData.skillLevel}
                        onValueChange={(value) => setFormData({ ...formData, skillLevel: value })}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Select skill level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="intermediate+">Intermediate+</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Gender */}
                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-white">Gender *</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => setFormData({ ...formData, gender: value })}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Emergency Contact */}
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact" className="text-white">Emergency Contact Name</Label>
                      <Input
                        id="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>

                    {/* Emergency Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone" className="text-white">Emergency Contact Phone</Label>
                      <div className="flex gap-2">
                        <Input
                          id="emergencyPhoneCountryCode"
                          type="text"
                          value={formData.emergencyPhoneCountryCode}
                          onChange={(e) => setFormData({ ...formData, emergencyPhoneCountryCode: e.target.value })}
                          className="bg-gray-800 border-gray-700 text-white w-24"
                          placeholder="+1"
                        />
                        <Input
                          id="emergencyPhoneNumber"
                          type="tel"
                          value={formData.emergencyPhoneNumber}
                          onChange={(e) => setFormData({ ...formData, emergencyPhoneNumber: e.target.value })}
                          className="bg-gray-800 border-gray-700 text-white flex-1"
                          placeholder="Phone number"
                        />
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="text-white">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>

                    {/* T-Shirt Size */}
                    <div className="space-y-2">
                      <Label htmlFor="tshirtSize" className="text-white">T-Shirt Size</Label>
                      <Select
                        value={formData.tshirtSize}
                        onValueChange={(value) => setFormData({ ...formData, tshirtSize: value })}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
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
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Phone Number</p>
                      <p className="text-white font-medium">{profile?.phone || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Skill Level</p>
                      <p className="text-white font-medium capitalize">{profile?.skillLevel || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Gender</p>
                      <p className="text-white font-medium capitalize">{profile?.gender?.replace('-', ' ') || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Emergency Contact</p>
                      <p className="text-white font-medium">{profile?.emergencyContact || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Emergency Phone</p>
                      <p className="text-white font-medium">{profile?.emergencyPhone || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Date of Birth</p>
                      <p className="text-white font-medium">{profile?.dateOfBirth || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">T-Shirt Size</p>
                      <p className="text-white font-medium uppercase">{profile?.tshirtSize || 'Not set'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Status */}
            {!profile?.profileComplete ? (
              <Card className="bg-gray-900/40 border-gray-700">
                <CardContent className="py-6">
                  <div className="flex items-start gap-4">
                    <Clock className="h-6 w-6 text-gray-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-300 mb-2">You are not registered yet</h3>
                      <p className="text-sm text-gray-400">
                        Complete your registration to access member features and participate in weekly schedules.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : !extendedProfile?.approved && (
              <Card className="bg-yellow-900/20 border-yellow-700">
                <CardContent className="py-6">
                  <div className="flex items-start gap-4">
                    <Clock className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-yellow-500 mb-2">Approval Pending</h3>
                      <p className="text-sm text-gray-300">
                        Your registration is being reviewed by our admin team. You will receive access to all member 
                        features once your account is approved. This usually takes 24-48 hours.
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        For urgent inquiries, contact us at +1 (289) 221-4150
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
