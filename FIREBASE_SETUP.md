# Firebase Setup Instructions

## ✅ Completed Steps
1. Firebase project created: `leo-badminton-club`
2. Google Authentication enabled
3. Firestore Database created
4. Firebase Storage enabled
5. Firebase configuration added to the application

## 🔒 Security Rules Setup

### Firestore Security Rules
You need to deploy the Firestore security rules to Firebase:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `leo-badminton-club`
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents from `firestore.rules` file
5. Paste into the Firebase console editor
6. Click **Publish**

### Storage Security Rules
You need to deploy the Storage security rules to Firebase:

1. In Firebase Console, go to **Storage** → **Rules**
2. Copy the contents from `storage.rules` file
3. Paste into the Firebase console editor
4. Click **Publish**

## 🎯 Making Yourself Admin

After you sign in for the first time:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `leo-badminton-club`
3. Navigate to **Firestore Database**
4. Find the `users` collection
5. Click on your user document (it will have your Google user ID)
6. Edit the document and change the `role` field from `member` to `admin`
7. Click **Update**
8. Refresh your browser to see the Admin panel in the navigation

## 📊 Firestore Collections Structure

The following collections will be created automatically as you use the app:

### users
- **uid**: User ID (from Firebase Auth)
- **email**: User email
- **displayName**: User display name
- **photoURL**: User profile photo URL
- **balance**: User balance (number)
- **role**: User role ('member' or 'admin')
- **createdAt**: Timestamp
- **updatedAt**: Timestamp

### leaderboard
- **uid**: Player ID
- **displayName**: Player name
- **email**: Player email
- **photoURL**: Player photo URL
- **rating**: Player rating (default 1500)
- **matches**: Number of matches played
- **wins**: Number of wins
- **updatedAt**: Timestamp

### matches
- **winner1Id**, **winner2Id**: Winner player IDs
- **loser1Id**, **loser2Id**: Loser player IDs
- **winner1Name**, **winner2Name**: Winner names
- **loser1Name**, **loser2Name**: Loser names
- **createdAt**: Timestamp

### tournaments
- **name**: Tournament name
- **description**: Tournament description
- **date**: Tournament date
- **location**: Tournament location
- **participants**: Number of participants
- **entryFee**: Entry fee (optional)
- **status**: Tournament status ('upcoming', 'completed')
- **createdAt**: Timestamp

### schedules
- **title**: Schedule title
- **description**: Schedule description
- **date**: Session date
- **time**: Session time
- **location**: Session location
- **maxPlayers**: Maximum number of players (optional)
- **fee**: Session fee (optional)
- **createdAt**: Timestamp

### registrations
- **scheduleId**: Schedule ID
- **userId**: User ID
- **userName**: User name
- **createdAt**: Timestamp

### payments
- **userId**: User ID
- **userName**: User name
- **amount**: Payment amount
- **type**: Payment type ('credit' or 'debit')
- **description**: Payment description
- **balance**: Balance after transaction
- **createdAt**: Timestamp

### community_posts
- **title**: Post title
- **content**: Post content
- **authorName**: Author name
- **authorPhotoURL**: Author photo URL
- **imageUrl**: Post image URL (optional)
- **createdAt**: Timestamp

## 🚀 Next Steps

1. **Deploy Security Rules** (as described above)
2. **Sign in with Google** on the website
3. **Make yourself admin** in Firestore
4. **Start using the admin panel** to:
   - Add schedules
   - Track payments
   - Manage users
   - Create tournaments (coming soon)
   - Post community updates (coming soon)

## 🔥 Firebase Storage Structure

```
tournaments/
  ├── {tournamentId}/
  │   └── photos/ (member-only access)
community/
  └── posts/ (public read)
profiles/
  └── {userId}/ (user-specific)
public/
  └── assets/ (public assets)
```

## 📝 Important Notes

- **TrueSkill Rating System**: Currently using a simplified Elo-like rating system. Can be upgraded to full TrueSkill implementation later.
- **Google Drive Integration**: Placeholder ready for future implementation of member-only tournament photos via Google Drive.
- **CDN**: Firebase Hosting already includes CDN by default.
- **Costs**: All features are within Firebase free tier for small to medium usage.

## 🎨 Features Implemented

### Public Pages
- ✅ Home page with hero section
- ✅ Leaderboard with rankings
- ✅ Tournaments listing
- ✅ Community posts
- ✅ Play schedule & registration

### Admin Panel
- ✅ Payment tracking (credit/debit transactions)
- ✅ User management (role assignment)
- ✅ Schedule management (create/delete schedules)

### Authentication
- ✅ Google Sign-In
- ✅ User profile creation
- ✅ Role-based access control

### Database
- ✅ Firestore collections
- ✅ Real-time data sync
- ✅ Secure access rules

## 🔧 Troubleshooting

If you encounter any issues:

1. **Can't sign in**: Make sure Google Sign-In is enabled in Firebase Authentication
2. **Can't see admin panel**: Make sure your user role is set to 'admin' in Firestore
3. **Permission denied errors**: Deploy the security rules as described above
4. **Data not loading**: Check browser console for errors and verify Firebase config
