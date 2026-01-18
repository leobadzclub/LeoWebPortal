'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import BackButton from '@/src/components/BackButton';

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg mb-4">
            <Users className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-purple-500">Community</span>
          </h1>
          <p className="text-xl text-gray-300">
            Connect with fellow badminton enthusiasts
          </p>
        </div>

        {/* Placeholder for community */}
        <div className="max-w-6xl mx-auto">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="py-16 text-center">
              <Users className="h-24 w-24 text-gray-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-4 text-white">Community Features Coming Soon</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                We're building an amazing community space where you can connect with other players, 
                share experiences, and stay updated with club news!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
