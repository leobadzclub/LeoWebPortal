# Leo Badminton Club Website

A comprehensive full-stack badminton club management platform built with Next.js 14, Firebase, and modern web technologies.

## 🎯 Features

### Public Features
- **Home Page**: Beautiful hero section with club information and call-to-actions
- **Leaderboard**: Real-time player rankings with TrueSkill-based rating system
- **Tournaments**: View upcoming and past tournaments with details
- **Community**: Club announcements and community posts
- **Play Schedule**: View weekly play sessions and register for sessions
- **Google Sign-In**: Secure authentication with Firebase Auth

### Admin Features (Admin-only access)
- **Payment Tracking**: Record credit/debit transactions and track member balances
- **User Management**: Manage club members and assign roles (admin/member)
- **Schedule Management**: Create and manage weekly play sessions
- **Role-based Access Control**: Secure admin-only features

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible UI components
- **Lucide React** - Icon library

### Backend & Database
- **Firebase Authentication** - Google Sign-In
- **Firestore** - NoSQL database for real-time data
- **Firebase Storage** - File storage for images and media

### Additional Libraries
- **date-fns** - Date formatting and manipulation
- **sonner** - Toast notifications
- **TrueSkill (simplified)** - Player rating system

## 📁 Project Structure

```
leo-badminton-club/
├── app/
│   ├── page.js                    # Home page
│   ├── layout.js                  # Root layout with auth provider
│   ├── leaderboard/page.js        # Leaderboard page
│   ├── tournaments/page.js        # Tournaments page
│   ├── community/page.js          # Community page
│   ├── play/page.js              # Play schedule page
│   └── admin/page.js             # Admin dashboard
├── src/
│   ├── lib/
│   │   ├── firebase.js           # Firebase configuration
│   │   ├── auth.js               # Authentication context & utilities
│   │   ├── firestore.js          # Firestore database utilities
│   │   └── trueskill.js          # Rating calculation system
│   └── components/
│       ├── Navbar.jsx            # Navigation bar
│       ├── Footer.jsx            # Footer
│       ├── Hero.jsx              # Hero section
│       └── admin/                # Admin components
│           ├── PaymentManagement.jsx
│           ├── UserManagement.jsx
│           └── ScheduleManagement.jsx
├── components/ui/                # shadcn/ui components
├── firestore.rules              # Firestore security rules
├── storage.rules                # Storage security rules
├── .env.local                   # Firebase configuration
└── FIREBASE_SETUP.md           # Detailed setup instructions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Firebase project created
- Google Sign-In enabled in Firebase

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd leo-badminton-club
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Google Authentication
   - Create Firestore Database
   - Enable Firebase Storage
   - Copy your Firebase config to `.env.local`

4. **Run the development server**
   ```bash
   yarn dev
   ```

5. **Open the application**
   - Navigate to `http://localhost:3000`

### Firebase Setup

See `FIREBASE_SETUP.md` for detailed instructions on:
- Deploying security rules
- Making yourself an admin
- Database structure
- Storage configuration

## 🔐 Security

### Firestore Security Rules
- **Users**: Read access for authenticated users, write access for self or admin
- **Leaderboard**: Public read, admin write
- **Matches**: Authenticated read, admin write
- **Tournaments**: Public read, admin write
- **Schedules**: Public read, admin write
- **Registrations**: Authenticated read/create, admin update/delete
- **Payments**: Admin-only access
- **Community Posts**: Public read, admin write

### Storage Security Rules
- **Tournament Photos**: Member-only access
- **Community Images**: Public read, admin write
- **Profile Images**: Public read, owner write
- **Public Assets**: Public read, admin write

## 📊 Database Collections

### users
User profiles with balance tracking and role management

### leaderboard
Player rankings with TrueSkill ratings, match history, and win rates

### matches
Match results for leaderboard calculation

### tournaments
Tournament information with dates, locations, and participants

### schedules
Weekly play sessions with registration tracking

### registrations
Player registrations for scheduled sessions

### payments
Financial transactions for balance tracking

### community_posts
Club announcements and community updates

## 🎨 UI Components

Built with shadcn/ui for a consistent, accessible, and beautiful interface:
- **Cards** - For content containers
- **Tables** - For data display
- **Dialogs** - For forms and modals
- **Buttons** - For actions
- **Badges** - For status indicators
- **Avatars** - For user profiles
- **Dropdowns** - For menus
- **And more...**

## 🏆 Features in Detail

### Leaderboard System
- TrueSkill-based rating calculation (simplified Elo implementation)
- Win/loss tracking
- Match history
- Top 3 highlighted with trophy icons

### Payment Tracking
- Credit/Debit transactions
- Balance management per user
- Transaction history
- Admin-only access

### User Management
- View all members
- Change user roles (member ↔ admin)
- View user balances
- Member profiles

### Schedule Management
- Create play sessions
- Set date, time, location
- Maximum player limits
- Session fees
- Registration tracking

## 🔮 Future Enhancements

- [ ] Tournament management (create, update, delete)
- [ ] Match result entry by admins
- [ ] Real-time leaderboard updates with TrueSkill
- [ ] Community post creation by admins
- [ ] Google Drive integration for member photos
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Mobile app
- [ ] Advanced analytics

## 📱 Responsive Design

Fully responsive design that works on:
- Desktop (1920px and above)
- Laptop (1024px - 1920px)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## 🤝 Contributing

This is a club-specific project. For improvements or bug fixes:
1. Create an issue describing the change
2. Submit a pull request with clear descriptions
3. Ensure all tests pass

## 📄 License

This project is private and proprietary to Leo Badminton Club.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Firebase for backend services
- shadcn/ui for beautiful components
- Tailwind CSS for styling utilities

## 📞 Support

For issues or questions:
- Email: info@leobadminton.club
- Phone: +91 98765 43210

---

Built with ❤️ for Leo Badminton Club
