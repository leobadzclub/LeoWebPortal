'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { useAuth } from '@/src/lib/auth';
import Link from 'next/link';

export default function ShuttleSlotPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-400 mb-8">You need to be logged in to book courts.</p>
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
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-500 shadow-lg mb-4">
            <Calendar className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Shuttle<span className="text-red-500">Slot</span>
          </h1>
          <p className="text-xl text-gray-300">
            Book your court and reserve your playing time
          </p>
        </div>

        {/* Info Cards */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Court Availability */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <MapPin className="h-6 w-6 text-red-500" />
                Court Availability
              </CardTitle>
              <CardDescription className="text-gray-400">
                Book courts for practice, matches, or training sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">Court 1</h3>
                    <span className="text-green-400 text-sm">Available</span>
                  </div>
                  <p className="text-sm text-gray-400">Premium court with professional lighting</p>
                </div>
                
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">Court 2</h3>
                    <span className="text-green-400 text-sm">Available</span>
                  </div>
                  <p className="text-sm text-gray-400">Standard court suitable for all levels</p>
                </div>
                
                <div className="p-4 bg-gray-800 rounded-lg opacity-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">Court 3</h3>
                    <span className="text-red-400 text-sm">Booked</span>
                  </div>
                  <p className="text-sm text-gray-400">Available after 8:00 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Instructions */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Clock className="h-6 w-6 text-red-500" />
                How to Book
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-sm font-bold flex-shrink-0">1</span>
                  <span>Check court availability for your preferred date and time</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-sm font-bold flex-shrink-0">2</span>
                  <span>Contact us via WhatsApp at +1 (289) 221-4150</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-sm font-bold flex-shrink-0">3</span>
                  <span>Provide your booking details (date, time, court preference)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-sm font-bold flex-shrink-0">4</span>
                  <span>Receive confirmation and payment instructions</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Users className="h-6 w-6 text-red-500" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">Peak Hours</h3>
                  <p className="text-sm text-gray-400 mb-2">6 PM - 10 PM</p>
                  <p className="text-2xl font-bold text-red-500">$25<span className="text-sm text-gray-400">/hour</span></p>
                </div>
                
                <div className="p-4 bg-gray-800 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">Off-Peak Hours</h3>
                  <p className="text-sm text-gray-400 mb-2">6 AM - 6 PM</p>
                  <p className="text-2xl font-bold text-red-500">$15<span className="text-sm text-gray-400">/hour</span></p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center pt-8">
            <Button 
              size="lg" 
              className="bg-red-500 hover:bg-red-600 text-white text-lg px-12 py-6"
              onClick={() => window.open('https://wa.me/12892214150?text=Hi! I would like to book a court.', '_blank')}
            >
              Book via WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
