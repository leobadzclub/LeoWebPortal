'use client';

import { Trophy, Users, Calendar, Award, Clock, Target, Dumbbell, Handshake } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/src/lib/auth';
import ApprovalPendingBanner from './ApprovalPendingBanner';

export default function Hero() {
  const { user, extendedProfile, signInWithGoogle } = useAuth();
  
  const isPendingApproval = user && extendedProfile?.profileComplete && !extendedProfile?.approved;

  return (
    <div className="premium-gradient text-white">
      {isPendingApproval && (
        <ApprovalPendingBanner userName={user.displayName?.split(' ')[0]} />
      )}
      
      {/* Hero Section - VISION */}
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 py-32 text-center relative z-10">
          <div className="flex justify-center mb-8">
            <div className="relative w-32 h-32 md:w-40 md:h-40">
              <Image
                src="/images/leo-logo.jpg"
                alt="LEO Badminton Club Logo"
                fill
                className="object-contain rounded-full border-4 border-yellow-400 shadow-2xl"
                priority
              />
            </div>
          </div>
          
          <p className="text-yellow-400 text-2xl md:text-4xl font-bebas mb-6 tracking-wide">LEO BADMINTON CLUB'S - VISION</p>
          
          <h1 className="text-3xl md:text-6xl font-bold tracking-tight mb-8 max-w-5xl mx-auto leading-tight">
            Brampton's Premier <span className="gold-text-gradient">Badminton Powerhouse</span>
          </h1>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
              LEO Badminton Club is more than a court — Brampton's premier badminton powerhouse, fueled by passion, excellence, and a community that lifts each other higher. We're here to spark growth, build confidence, and bring people together through the pure love of the game.
            </p>
            
            <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
              Whether you're chasing sharper skills, new friendships, or the thrill of every rally, you'll step into a vibrant, professional, and uplifting environment that celebrates badminton at its brightest. At LEO, we champion your journey — helping you rise on the court and shine in your career.
            </p>
          </div>
          
          <div className="crown-divider mt-8"></div>
        </div>
      </div>

      {/* About Us Section */}
      <div className="container mx-auto px-4 py-24 border-t border-yellow-400/20 relative">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/leo-background.jpeg"
            alt="About Us Background"
            fill
            className="object-cover opacity-20"
            style={{ filter: 'blur(1px) brightness(0.7)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900/90 via-navy-900/80 to-navy-900/90"></div>
        </div>
        
        <div className="relative z-10">
          <p className="text-yellow-400 text-2xl md:text-4xl font-bebas mb-6 tracking-wide text-center">ABOUT US</p>
          <h2 className="text-3xl md:text-6xl font-bold text-center mb-6">
            Smash your limits. <span className="gold-text-gradient">Strength in Unity.</span> Excellence in Play.
          </h2>
          <p className="text-lg md:text-xl text-yellow-100 text-center max-w-4xl mx-auto mb-6 italic">
            Where passion for badminton meets professionalism.
          </p>
          <p className="text-base md:text-lg text-blue-100 text-center max-w-4xl mx-auto leading-relaxed">
            LEO Badminton Club is a vibrant community built on resilience, respect, and growth. Inspired by the lion, our emblem of courage and strength, we welcome players of all skill levels into an inclusive environment that celebrates both sport and personal development. More than a club, we are a hub for empowerment and connection.
          </p>
        </div>
      </div>

      {/* Events Section */}
      <div className="bg-gray-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/tournament-bg.jpg"
            alt="Events"
            fill
            className="object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-gray-900/95"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <p className="text-yellow-400 text-2xl md:text-4xl font-bebas mb-6 tracking-wide text-center">EVENTS</p>
            <h2 className="text-3xl md:text-6xl font-bold mb-6 text-center">Challenge. Celebrate. Connect.</h2>
            <p className="text-lg md:text-xl text-yellow-100 mb-6 italic text-center">
              Tournaments and fitness events that bring us together.
            </p>
            <p className="text-base md:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed text-center">
              LEO Badminton Club organizes regular member-only tournaments, offering opportunities to compete, learn, and grow. We also host community-building events such as trail walks and wellness activities, blending sport and fitness with camaraderie. Every event strengthens bonds and creates lasting memories both on and off the court.
            </p>
          </div>
          <div className="text-center mt-8">
            <Link href="/tournaments">
              <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white font-semibold text-lg px-8 py-4 rounded-full">
                View Events
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Schedules Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <p className="text-yellow-400 text-2xl md:text-4xl font-bebas mb-6 tracking-wide text-center">SCHEDULES</p>
          <h2 className="text-3xl md:text-6xl font-bold mb-6 text-center">Your Time, Your Game.</h2>
          <p className="text-lg md:text-xl text-yellow-100 mb-6 italic text-center">
            Flexible sessions for every lifestyle.
          </p>
          <p className="text-base md:text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12 text-center">
            We host two-hour sessions on Saturday and Sunday mornings (6:00 am – 9:00 am) and Wednesday and Thursday evenings (8:00 pm – 11:00 pm). In addition, we arrange on-demand family sessions, including Family Badminton and Parent-Child Badminton, based on member interest. Whether you're an early riser or prefer evening play, our schedule ensures everyone finds their perfect time to enjoy the game.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="bg-gray-900 p-8 rounded-2xl text-center border-2 border-red-500/30 hover:border-red-500 transition-all">
            <Clock className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Wednesday</h3>
            <p className="text-xl text-gray-300">8 PM - 10 PM</p>
          </div>
          
          <div className="bg-gray-900 p-8 rounded-2xl text-center border-2 border-red-500/30 hover:border-red-500 transition-all">
            <Clock className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Thursday</h3>
            <p className="text-xl text-gray-300">8 PM - 10 PM</p>
          </div>
          
          <div className="bg-gray-900 p-8 rounded-2xl text-center border-2 border-red-500/30 hover:border-red-500 transition-all">
            <Clock className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Saturday</h3>
            <p className="text-xl text-gray-300">6 AM - 8 AM</p>
          </div>
          
          <div className="bg-gray-900 p-8 rounded-2xl text-center border-2 border-red-500/30 hover:border-red-500 transition-all">
            <Clock className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Sunday</h3>
            <p className="text-xl text-gray-300">7 AM - 9 AM</p>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/weekly-schedule">
            <Button size="lg" className="bg-white hover:bg-gray-200 text-black font-semibold text-lg px-10 py-6 rounded-full">
              View Full Schedule
            </Button>
          </Link>
        </div>
      </div>

      {/* Activities Section */}
      <div className="bg-gray-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/activities-bg.jpg"
            alt="Activities"
            fill
            className="object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/95 via-gray-900/85 to-gray-900/95"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <p className="text-yellow-400 text-2xl md:text-4xl font-bebas mb-6 tracking-wide text-center">ACTIVITIES</p>
            <h2 className="text-3xl md:text-6xl font-bold mb-6 text-center">Play. Improve. Grow.</h2>
            <p className="text-lg md:text-xl text-yellow-100 mb-6 italic text-center">
              Beyond the court, into fitness and career.
            </p>
            <p className="text-base md:text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed text-center">
              Our members enjoy structured badminton sessions, tournaments designed to sharpen skills, and fitness activities such as trail walks. With many members working in IT, the club also supports professional growth through networking and knowledge sharing. Activities at LEO Badminton Club are designed to balance sport, wellness, and career development.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <p className="text-yellow-400 text-2xl md:text-4xl font-bebas mb-6 tracking-wide text-center">BENEFITS</p>
          <h2 className="text-3xl md:text-6xl font-bold mb-6 text-center">More Than Play.</h2>
          <p className="text-lg md:text-xl text-yellow-100 mb-6 italic text-center">
            Exclusive perks for our members.
          </p>
          <p className="text-base md:text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed mb-16 text-center">
            Membership comes with special privileges, including discounted prices on badminton gear such as shoes, rackets, and birdies. Members also enjoy discounts at selected restaurants, fitness trainers, and physiotherapists, extending the club's value beyond the court. These benefits make LEO Badminton Club not only a place to play but also a lifestyle community that supports health, fitness, and everyday life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center space-y-4 p-8 bg-gray-900 rounded-2xl border-2 border-red-500/20 hover:border-red-500 transition-all relative overflow-hidden group">
            <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-20 transition-opacity">
              <Image src="/images/coaching-bg.jpg" alt="Professional Coaching" fill className="object-cover" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-xl">Professional Coaching</h3>
              <p className="text-sm text-gray-400">Learn from experienced coaches and improve your game</p>
            </div>
          </div>

          <div className="text-center space-y-4 p-8 bg-gray-900 rounded-2xl border-2 border-red-500/20 hover:border-red-500 transition-all relative overflow-hidden group">
            <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-20 transition-opacity">
              <Image src="/images/community-bg.jpg" alt="Vibrant Community" fill className="object-cover" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-xl">Vibrant Community</h3>
              <p className="text-sm text-gray-400">Connect with passionate players and build lasting friendships</p>
            </div>
          </div>

          <div className="text-center space-y-4 p-8 bg-gray-900 rounded-2xl border-2 border-red-500/20 hover:border-red-500 transition-all relative overflow-hidden group">
            <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-20 transition-opacity">
              <Image src="/images/networking-bg.jpg" alt="Business Networking" fill className="object-cover" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500">
                <Handshake className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-xl">Business Networking</h3>
              <p className="text-sm text-gray-400">Grow your professional network while staying active</p>
            </div>
          </div>

          <div className="text-center space-y-4 p-8 bg-gray-900 rounded-2xl border-2 border-red-500/20 hover:border-red-500 transition-all relative overflow-hidden group">
            <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-20 transition-opacity">
              <Image src="/images/facilities-bg.jpg" alt="Top Facilities" fill className="object-cover" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-xl">Top Facilities</h3>
              <p className="text-sm text-gray-400">Train in premium facilities with all amenities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Join Us Section */}
      <div className="container mx-auto px-4 py-24 relative">
        <div className="text-center mb-16">
          <p className="text-yellow-400 text-2xl md:text-4xl font-bold mb-6 tracking-wide">JOIN US</p>
          <h2 className="text-3xl md:text-6xl font-bold mb-8">
            Step into <span className="gold-text-gradient">Leo</span> Badminton Club
          </h2>
          <p className="text-base md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Become part of a vibrant, high-energy community that celebrates fair play, personal growth, and genuine connection. If you love the game, you'll love it here.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {/* Who Can Join */}
          <div className="bg-gray-900 p-8 rounded-2xl border-2 border-yellow-400/30 hover:border-yellow-400 transition-all">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-400 mb-6">
              <Users className="h-8 w-8 text-navy-900" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">Who Can Join</h3>
            <p className="text-gray-300 leading-relaxed">
              Everyone with a passion for badminton is welcome. Whether you're smashing birdies for fun or training to compete, LEO has a place ready for you.
            </p>
          </div>

          {/* How to Join */}
          <div className="bg-gray-900 p-8 rounded-2xl border-2 border-yellow-400/30 hover:border-yellow-400 transition-all">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-400 mb-6">
              <Award className="h-8 w-8 text-navy-900" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">How to Join</h3>
            <ol className="text-gray-300 leading-relaxed space-y-3 list-decimal list-inside">
              <li>Reach out to our club administrators and let us know you're in.</li>
              <li>Look over and agree to our club rules and code of conduct.</li>
              <li>Jump into our scheduled sessions whenever they fit your schedule.</li>
            </ol>
          </div>
        </div>

        <div className="text-center">
          {user ? (
            <Link href="/profile">
              <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-navy-900 font-bold text-lg px-10 py-6 rounded-full shadow-lg">
                Complete Your Profile
              </Button>
            </Link>
          ) : (
            <Button onClick={signInWithGoogle} size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-navy-900 font-bold text-lg px-10 py-6 rounded-full shadow-lg">
              Get Started Today
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
