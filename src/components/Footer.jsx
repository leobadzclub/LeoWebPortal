import { Trophy, Mail, MapPin, Phone, Youtube, Facebook, Instagram } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 to-blue-950 text-slate-200 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/images/leo-logo.jpg"
                  alt="LEO Badminton Club Logo"
                  fill
                  className="object-contain rounded-full"
                />
              </div>
              <span className="font-bold text-lg text-yellow-400">LEO Badminton Club</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Brampton's premier badminton hub — where passion meets purpose, and every rally fuels growth. At LEO, we empower players of all levels to rise, connect, and thrive in a vibrant community built on excellence and unity. Step in, level up, and let your journey soar.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-yellow-400">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-slate-300 hover:text-yellow-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-slate-300 hover:text-yellow-400 transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-slate-300 hover:text-yellow-400 transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="text-slate-300 hover:text-yellow-400 transition-colors">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href="/policies" className="text-slate-300 hover:text-yellow-400 transition-colors">
                  Policies
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="text-slate-300 hover:text-yellow-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-yellow-400">Contact</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center space-x-2 hover:text-yellow-400 transition-colors">
                <Mail className="h-4 w-4" />
                <span>leosportzclub@gmail.com</span>
              </li>
              <li className="flex items-center space-x-2 hover:text-yellow-400 transition-colors">
                <Phone className="h-4 w-4" />
                <span>+1 (289) 221-4150</span>
              </li>
              <li className="flex items-center space-x-2 hover:text-yellow-400 transition-colors">
                <MapPin className="h-4 w-4" />
                <span>Brampton, ON, Canada</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-semibold mb-4 text-yellow-400">Social Media Connect</h3>
            <div className="space-y-3">
              <a 
                href="https://www.youtube.com/@LEOBadmintonClub" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-sm text-slate-300 hover:text-red-500 transition-colors group"
              >
                <div className="bg-slate-800 p-2 rounded-full group-hover:bg-red-500 transition-colors">
                  <Youtube className="h-5 w-5" />
                </div>
                <span>YouTube</span>
              </a>
              
              <a 
                href="https://www.facebook.com/share/1CAfbChsw3/?mibextid=wwXIfr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-sm text-slate-300 hover:text-blue-500 transition-colors group"
              >
                <div className="bg-slate-800 p-2 rounded-full group-hover:bg-blue-500 transition-colors">
                  <Facebook className="h-5 w-5" />
                </div>
                <span>Facebook</span>
              </a>
              
              <a 
                href="https://www.instagram.com/leobadmintonclub.ca/?igsh=N3J1dWtsZmh3aGF6#" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-sm text-slate-300 hover:text-pink-500 transition-colors group"
              >
                <div className="bg-slate-800 p-2 rounded-full group-hover:bg-gradient-to-br group-hover:from-purple-500 group-hover:to-pink-500 transition-colors">
                  <Instagram className="h-5 w-5" />
                </div>
                <span>Instagram</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-700 text-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} LEO Badminton Club. All rights reserved.</p>
          <p className="mt-2">
            <a href={process.env.NEXT_PUBLIC_SITE_URL || "https://www.leosportzclub.com"} className="hover:text-yellow-400 transition-colors">
              leosportzclub.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}