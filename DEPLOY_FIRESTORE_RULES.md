# 🔥 Deploy Updated Firestore Rules

## The Issue
The registration form is failing because Firebase Firestore doesn't have permissions set for the `member_registrations` collection.

## What I Fixed
Added these rules to `firestore.rules`:

```javascript
// Member registrations collection (public can create)
match /member_registrations/{registrationId} {
  allow read: if isAdmin();
  allow create: if true; // Anyone can submit registration
  allow update, delete: if isAdmin();
}

// Profiles collection (extended user profiles)
match /profiles/{userId} {
  allow read: if isSignedIn();
  allow write: if isOwner(userId) || isAdmin();
  allow create: if isSignedIn() && isOwner(userId);
}
```

## How to Deploy (Choose One Method)

### Method 1: Firebase Console (Easiest - 2 minutes)

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Select your Leo Sportz Club project

2. **Navigate to Firestore Rules**
   - Click **"Firestore Database"** in left sidebar
   - Click **"Rules"** tab at the top

3. **Copy the New Rules**
   - Copy the entire content from `/app/firestore.rules`
   - Paste into the Firebase Console editor

4. **Publish**
   - Click **"Publish"** button
   - Wait for confirmation

5. **Test**
   - Try submitting the registration form again
   - Should work now! ✅

---

### Method 2: Firebase CLI (If you have it installed)

```bash
cd /app
firebase deploy --only firestore:rules
```

---

## Verify It Works

After deploying, test the registration form:

1. Go to your homepage
2. Click "Join Us Today"
3. Fill in the form
4. Click "Submit Registration"
5. Should see: "Registration submitted successfully!"

---

## Temporary Workaround (If you can't deploy right now)

You can set Firestore to test mode temporarily:

1. Go to Firebase Console → Firestore Database → Rules
2. Replace with this (TEMPORARY ONLY):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **WARNING**: This allows anyone to read/write ALL data. Only use for testing, then replace with proper rules!

---

## What These Rules Do

**Member Registrations:**
- ✅ Anyone can CREATE a registration (no sign-in required)
- ✅ Only admins can READ registrations (privacy)
- ✅ Only admins can UPDATE/DELETE registrations

**Profiles:**
- ✅ Signed-in users can read profiles
- ✅ Users can only write their own profile
- ✅ Admins can manage all profiles

---

## After Deploying

The registration form will work and you'll be able to:
- Accept registrations from anyone (no sign-in needed)
- View all registrations in Firebase Console
- Approve/reject registrations through admin panel (coming soon)
