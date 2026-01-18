'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/src/lib/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Trophy, Menu, X } from 'lucide-react';
import { useState } from 'react';
import RegistrationForm from './RegistrationForm';

export default function Navbar() {
  const { user, userProfile, extendedProfile, signOut, signInWithGoogle } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  
  const isAdmin = userProfile?.role === 'admin';
  const isApprovedMember = extendedProfile?.approved === true;

  // Public links (visible to everyone)
  const publicLinks = [
    { href: '/', label: 'Home' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/community', label: 'Community' },
    { href: '/testimonials', label: 'Testimonials' },
    { href: '/policies', label: 'Policies' },
  ];

  // Member links (visible only to approved members)
  const memberLinks = [
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/tournaments', label: 'Tournaments' },
    { href: '/weekly-schedule', label: 'Weekly Schedule' },
    { href: '/my-bookings', label: 'My Bookings' },
    { href: '/shuttle-slot', label: 'ShuttleSlot' },
  ];

  // Determine which links to show
  const navLinks = isApprovedMember || isAdmin 
    ? [...publicLinks, ...memberLinks] 
    : publicLinks;

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="relative w-12 h-12">
              <Image
                src="/images/leo-logo.jpg"
                alt="LEO Badminton Club Logo"
                fill
                className="object-contain rounded-full"
              />
            </div>
            <span className="font-bold text-xl hidden sm:inline-block">LEO Badminton Club</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button variant="ghost">{link.label}</Button>
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin">
                <Button variant="ghost">Admin</Button>
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={user.photoURL} alt={user.displayName} />
                      <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.displayName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      {userProfile && (
                        <p className="text-xs text-muted-foreground">Balance: CA$ {userProfile.balance || 0}</p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem>My Profile</DropdownMenuItem>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin">
                      <DropdownMenuItem>Admin Panel</DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button onClick={signInWithGoogle} className="btn-gold">
                  Login / Register
                </Button>
                <RegistrationForm 
                  open={showRegistrationForm} 
                  onClose={() => setShowRegistrationForm(false)} 
                />
              </>
            )}
          </div>

          {/* Mobile menu button and User Avatar/Login */}
          <div className="md:hidden flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL} alt={user.displayName} />
                      <AvatarFallback className="bg-yellow-400 text-navy-900">
                        {user.displayName?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.displayName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      {userProfile && (
                        <p className="text-xs text-muted-foreground">Balance: CA$ {userProfile.balance || 0}</p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem>My Profile</DropdownMenuItem>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin">
                      <DropdownMenuItem>Admin Panel</DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={signInWithGoogle} className="btn-gold text-xs px-3 py-2 h-9 whitespace-nowrap">
                LOGIN / REGISTER
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  {link.label}
                </Button>
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Admin
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}