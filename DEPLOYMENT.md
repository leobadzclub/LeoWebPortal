# 🚀 Deployment Guide - Leo Badminton Club

## Firebase Hosting Deployment

This guide covers deploying your Next.js app to Firebase Hosting with CDN, SSL, and optimal caching.

---

## 📋 Prerequisites

1. **Firebase CLI installed**
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase project configured**
   - Project: `leo-badminton-club`
   - Authentication, Firestore, and Storage already set up ✅

3. **Next.js app ready**
   - All features tested locally ✅

---

## 🔧 Deployment Steps

### Step 1: Login to Firebase

```bash
firebase login
```

This will open a browser for authentication.

---

### Step 2: Build Next.js for Static Export

Update `next.config.js` to enable static export:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

module.exports = nextConfig;
```

Then build:

```bash
yarn build
```

This creates an `out` directory with your static site.

---

### Step 3: Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

This will:
- Upload your `out` directory to Firebase Hosting
- Configure CDN caching
- Enable SSL automatically
- Set up custom headers

---

### Step 4: Deploy Security Rules

Deploy Firestore and Storage rules:

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

Or deploy everything at once:

```bash
firebase deploy
```

---

## 🌐 Custom Domain Setup (leobadmintonclub.com)

### Step 1: Add Custom Domain in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **leo-badminton-club**
3. Go to **Hosting** → **Add custom domain**
4. Enter: `leobadmintonclub.com`
5. Firebase will provide DNS records

### Step 2: Update DNS Records

Add these records to your domain registrar (where you bought leobadmintonclub.com):

**A Records:**
```
Type: A
Name: @
Value: <IP provided by Firebase>

Type: A
Name: @
Value: <IP provided by Firebase>
```

**Optional - WWW subdomain:**
```
Type: CNAME
Name: www
Value: leobadmintonclub.com
```

### Step 3: Wait for SSL Certificate

- Firebase automatically provisions SSL certificate
- Takes 24-48 hours for DNS propagation
- Once complete, your site will be live at `https://leobadmintonclub.com`

---

## 🔥 Firebase Hosting Features (Already Configured)

### ✅ CDN Caching
- Images: 1 year cache
- JS/CSS: 1 year cache (with immutable flag)
- Fonts: 1 year cache with CORS
- Automatically served from global CDN

### ✅ Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: enabled

### ✅ Performance Optimizations
- Clean URLs (no .html extension)
- No trailing slashes
- Automatic compression (gzip/brotli)
- HTTP/2 enabled

### ✅ SSL/HTTPS
- Automatic SSL certificate
- Auto-renewal
- HTTPS redirect enabled

---

## 📊 Monitoring & Analytics

### Firebase Hosting Dashboard
- Go to Firebase Console → Hosting
- View:
  - Total requests
  - Bandwidth usage
  - Response times
  - Error rates

### Google Analytics (Optional)
Add Google Analytics to track:
- Page views
- User behavior
- Conversion tracking

---

## 🔄 Continuous Deployment

### Option 1: Manual Deployment
```bash
yarn build
firebase deploy --only hosting
```

### Option 2: GitHub Actions (Automated)

Create `.github/workflows/firebase-hosting.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: yarn install
      
      - name: Build
        run: yarn build
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: leo-badminton-club
```

---

## 🚨 Important Notes

### 1. Environment Variables
For static export, environment variables must be **public** (prefixed with `NEXT_PUBLIC_`):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# etc.
```

### 2. Dynamic Routes
Static export doesn't support:
- API routes (use Firebase Cloud Functions instead)
- Server-side rendering
- Dynamic route parameters without pre-generation

Our app is already designed for static export! ✅

### 3. Authorized Domains
Don't forget to add your custom domain to Firebase Auth:
1. Firebase Console → Authentication → Settings
2. Add `leobadmintonclub.com` to Authorized domains

---

## 🎯 Deployment Checklist

- [ ] Firebase CLI installed
- [ ] Logged into Firebase (`firebase login`)
- [ ] Built Next.js app (`yarn build`)
- [ ] Deployed hosting (`firebase deploy --only hosting`)
- [ ] Deployed security rules (`firebase deploy --only firestore:rules,storage:rules`)
- [ ] Deployed indexes (`firebase deploy --only firestore:indexes`)
- [ ] Added custom domain in Firebase Console
- [ ] Updated DNS records at domain registrar
- [ ] Added custom domain to Firebase Auth authorized domains
- [ ] Waited for SSL certificate provisioning (24-48 hours)
- [ ] Tested website at custom domain

---

## 💰 Cost Analysis

### Firebase Hosting - Spark (Free) Plan:
- **Storage**: 10 GB
- **Bandwidth**: 360 MB/day (~10 GB/month)
- **Custom domain**: Free ✅
- **SSL certificate**: Free ✅
- **CDN**: Free ✅

### Blaze (Pay-as-you-go) Plan:
Only needed if you exceed free tier:
- **Storage**: $0.026/GB
- **Bandwidth**: $0.15/GB

**Estimated monthly cost for small club (~1000 users):**
- Hosting: Free
- Firestore: Free (within 50k reads/day)
- Storage: Free (within 5GB)
- Auth: Free

**Total: $0/month** 🎉

---

## 🆘 Troubleshooting

### Issue: "Firebase command not found"
```bash
npm install -g firebase-tools
```

### Issue: "Build fails with export error"
Make sure `next.config.js` has `output: 'export'`

### Issue: "Custom domain not working"
- Check DNS propagation: https://www.whatsmydns.net/
- Verify DNS records match Firebase's instructions
- Wait 24-48 hours for SSL provisioning

### Issue: "Auth error on custom domain"
Add your custom domain to Firebase Auth authorized domains

---

## 📚 Resources

- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Custom Domain Setup](https://firebase.google.com/docs/hosting/custom-domain)

---

## ✅ Post-Deployment

After successful deployment:

1. **Test all pages**:
   - Home, Leaderboard, Tournaments, Community, Play, Admin

2. **Test authentication**:
   - Google Sign-In
   - Admin access

3. **Test functionality**:
   - Schedule registration
   - Payment tracking
   - User management

4. **Monitor performance**:
   - Check Firebase Hosting dashboard
   - Monitor bandwidth usage
   - Check error logs

5. **Share with club members** 🎉

---

Your Leo Badminton Club website is now live with:
- ✅ Global CDN
- ✅ Automatic SSL
- ✅ Optimal caching
- ✅ Security headers
- ✅ Custom domain ready

Enjoy your production-ready badminton club website! 🏸
