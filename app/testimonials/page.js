'use client';

import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Star } from 'lucide-react';
import BackButton from '@/src/components/BackButton';

export default function TestimonialPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg mb-4">
            <MessageSquare className="h-10 w-10 text-navy-900" />
          </div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-yellow-400">Testimonials</span>
          </h1>
          <p className="text-xl text-gray-300">
            What our members say about LEO Badminton Club
          </p>
        </div>

        {/* Placeholder for testimonials */}
        <div className="max-w-6xl mx-auto">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="py-16 text-center">
              <div className="flex justify-center mb-6">
                <Star className="h-12 w-12 text-yellow-400" />
                <Star className="h-12 w-12 text-yellow-400 mx-2" />
                <Star className="h-12 w-12 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Testimonials Coming Soon</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                We're collecting feedback from our amazing community members. Check back soon to see what 
                our players have to say about their experience at LEO Badminton Club!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
