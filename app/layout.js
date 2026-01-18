import { Montserrat, Bebas_Neue, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/src/lib/auth';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';
import WhatsAppFloat from '@/src/components/WhatsAppFloat';
import { Toaster } from '@/components/ui/sonner';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
});

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'LEO Badminton Club - Smash Your Limits | Brampton, ON',
  description: 'Join LEO Badminton Club in Brampton, ON, Canada - Premier badminton club with competitive play, tournaments, TrueSkill leaderboard, and an active community. Contact us at leosportzclub@gmail.com or +1 (289) 221-4150',
  keywords: 'badminton, club, sports, tournament, leaderboard, community, LEO Badminton Club, Brampton, Ontario, Canada',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${bebasNeue.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <WhatsAppFloat />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}