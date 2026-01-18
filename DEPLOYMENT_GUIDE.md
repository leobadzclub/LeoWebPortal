# 🚀 Leo Sportz Club - Deployment Guide

## Current Status
- **Preview URL**: https://leo-badminton-1.preview.emergentagent.com
- **Target Domain**: www.leosportzclub.com
- **Platform**: Next.js 14 with Firebase (Auth, Firestore, Storage)

---

## Deployment Options

### ✅ Option 1: Emergent Platform (Current - Recommended)

**Your app is already running on Emergent's Kubernetes platform.**

#### To Use Custom Domain (www.leosportzclub.com):

**Step 1: Contact Emergent Support**
- Ask for custom domain configuration
- They will provide DNS settings for `www.leosportzclub.com`

**Step 2: Configure DNS**
At your domain registrar (wherever you bought leosportzclub.com):
- Add the DNS records provided by Emergent
- Usually A records or CNAME records

**Step 3: Update Firebase Auth**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Navigate to **Authentication** → **Settings** → **Authorized domains**
3. Add these domains:
   ```
   www.leosportzclub.com
   leosportzclub.com
   shuttle-club.preview.emergentagent.com
   localhost
   ```

**Advantages:**
- ✅ Already configured and running
- ✅ No migration needed
- ✅ Environment variables already set
- ✅ Zero additional cost
- ✅ Integrated with your development workflow

---

### Option 2: Deploy to Vercel (Alternative)

If you prefer Vercel for Next.js deployment:

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Deploy
```bash
cd /app
vercel
```

Follow the prompts:
- Link to existing project or create new
- Confirm framework detection (Next.js)
- Deploy

#### Step 3: Add Environment Variables in Vercel Dashboard
Go to Project Settings → Environment Variables and add:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement
MONGO_URL=your_mongo_url
DB_NAME=your_db_name
```

#### Step 4: Configure Custom Domain in Vercel
1. Go to Project Settings → Domains
2. Add `www.leosportzclub.com`
3. Follow DNS configuration instructions
4. Vercel auto-provisions SSL certificate

#### Step 5: Update Firebase Auth
Add `www.leosportzclub.com` to Firebase authorized domains (same as Option 1)

**Advantages:**
- ✅ Built for Next.js
- ✅ Automatic builds on git push
- ✅ Easy custom domain setup
- ✅ Free SSL certificates
- ✅ Global CDN

**Cost**: Free tier available (generous limits)

---

### Option 3: Firebase Hosting (Static Export Only)

**⚠️ NOT RECOMMENDED for this app** - Requires converting to static export, which loses server-side features.

---

## Recommended Path: Emergent Platform

Since you're already successfully running on Emergent's platform at `shuttle-club.preview.emergentagent.com`, the easiest path is:

### Next Steps:

**1. Add Current Domain to Firebase Auth (Do This Now!)**
   - Go to Firebase Console → Authentication → Settings → Authorized domains
   - Add: `shuttle-club.preview.emergentagent.com`
   - This will fix your current `auth/unauthorized-domain` error

**2. For Custom Domain (www.leosportzclub.com):**
   - Contact Emergent support for custom domain setup instructions
   - OR use Vercel if you prefer that platform

**3. Performance Optimizations (Recommended):**
   - Fix N+1 query in `/app/app/play/page.js`
   - Add `.limit()` to Firestore queries in `/app/src/lib/firestore.js`
   - Add Firestore indexes for better query performance

---

## Firebase Required Setup (All Options)

Regardless of deployment platform, you MUST configure Firebase:

### 1. Authorized Domains
Add all domains where your app will run:
- ✅ `localhost` (for development)
- ✅ `shuttle-club.preview.emergentagent.com` (current preview)
- ✅ `www.leosportzclub.com` (production)
- ✅ `leosportzclub.com` (without www)

### 2. Firestore Indexes
Create composite indexes for queries with orderBy:
```json
{
  "indexes": [
    {
      "collectionGroup": "leaderboard",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "rating", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "matches",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## Quick Fix: Current Auth Error

To fix the immediate `auth/unauthorized-domain` error on your preview site:

**🚨 DO THIS NOW:**

1. Go to https://console.firebase.google.com
2. Select your project
3. Click **Authentication** → **Settings** tab
4. Scroll to **Authorized domains**
5. Click **"Add domain"**
6. Enter: `shuttle-club.preview.emergentagent.com`
7. Click **"Add"**
8. Wait 1-2 minutes for propagation
9. Refresh your app - authentication should work!

---

## Support Contacts

- **Emergent Platform Support**: [Contact through your dashboard]
- **Firebase Support**: https://firebase.google.com/support
- **Vercel Support**: https://vercel.com/support

---

## Estimated Costs

### Emergent Platform
- Check with Emergent for pricing
- Custom domain may have additional fees

### Vercel
- **Free Tier**: 100 GB bandwidth, unlimited sites
- **Pro**: $20/month (if you exceed free tier)

### Firebase
- **Spark Plan (Free)**: 
  - 50K daily reads, 20K writes
  - 1 GB storage
  - Good for small clubs
- **Blaze Plan (Pay as you go)**: 
  - Scale automatically
  - Typically $0-5/month for small apps

---

## Decision Matrix

| Feature | Emergent | Vercel | Firebase Hosting |
|---------|----------|--------|------------------|
| Already Set Up | ✅ Yes | ❌ No | ❌ No |
| Migration Needed | ✅ None | ⚠️ Minimal | ❌ Major |
| Custom Domain | ✅ Yes | ✅ Yes | ✅ Yes |
| Server Features | ✅ Yes | ✅ Yes | ❌ Static only |
| Easy Updates | ✅ Integrated | ✅ Git-based | ⚠️ Manual |
| Cost | Check platform | Free/Paid | Free |

**Recommendation**: Stay on Emergent platform, add custom domain when ready.

---

## What To Do Right Now

**IMMEDIATE (Fix Auth Error):**
1. Add `shuttle-club.preview.emergentagent.com` to Firebase authorized domains
2. Test authentication on preview site

**SHORT TERM (Within 1 week):**
1. Decide on deployment platform (Emergent vs Vercel)
2. If staying on Emergent: Contact support for custom domain setup
3. If moving to Vercel: Run `vercel` command and configure

**LONG TERM (Optional Improvements):**
1. Optimize database queries
2. Add Firestore indexes
3. Implement pagination for large data sets
4. Add monitoring and analytics

---

Need help with any of these steps? Let me know which deployment path you'd like to pursue!
