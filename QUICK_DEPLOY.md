# 🚀 Quick Deploy Guide

## One-Time Setup (5 minutes)

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Update next.config.js
Add this to enable static export:

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

---

## Deploy Commands

### Deploy Everything (First Time)
```bash
yarn deploy:all
```
This deploys:
- Website to Firebase Hosting
- Firestore security rules
- Storage security rules
- Firestore indexes

### Deploy Website Only (Quick Updates)
```bash
yarn deploy
```

### Deploy Security Rules Only
```bash
yarn deploy:rules
```

### Deploy Indexes Only
```bash
yarn deploy:indexes
```

---

## Custom Domain Setup (leobadmintonclub.com)

### In Firebase Console:
1. Go to **Hosting** → **Add custom domain**
2. Enter: `leobadmintonclub.com`
3. Copy the DNS records provided

### At Your Domain Registrar:
Add these DNS records (values from Firebase):
```
Type: A
Name: @
Value: <IP from Firebase>

Type: A  
Name: @
Value: <IP from Firebase>
```

### In Firebase Authentication:
1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Add: `leobadmintonclub.com`
3. Add: `www.leobadmintonclub.com`

### Wait:
- DNS propagation: 1-24 hours
- SSL certificate: 24-48 hours
- Then your site is live at `https://leobadmintonclub.com` 🎉

---

## Deployment Checklist

Before first deployment:
- [ ] Firebase CLI installed
- [ ] Logged into Firebase
- [ ] `next.config.js` updated with export config
- [ ] Built and tested locally (`yarn build`)

For each deployment:
- [ ] Test locally (`yarn dev`)
- [ ] Build for production (`yarn build`)
- [ ] Deploy (`yarn deploy`)
- [ ] Test live site
- [ ] Check Firebase Console for any errors

---

## Troubleshooting

**Build Error?**
- Check `next.config.js` has `output: 'export'`
- Run `yarn build` to see detailed errors

**Deploy Error?**
- Check Firebase login: `firebase login`
- Verify project: `firebase projects:list`

**Auth Error on Custom Domain?**
- Add domain to Firebase Auth authorized domains
- Wait for DNS propagation

**Site Not Updating?**
- Clear browser cache
- Check Firebase Hosting dashboard for new deployment

---

## Quick URLs

- **Firebase Console**: https://console.firebase.google.com/project/leo-badminton-club
- **Hosting Dashboard**: https://console.firebase.google.com/project/leo-badminton-club/hosting
- **Authentication**: https://console.firebase.google.com/project/leo-badminton-club/authentication
- **Firestore**: https://console.firebase.google.com/project/leo-badminton-club/firestore

---

## Cost (Free Tier)

Firebase Spark Plan includes:
- ✅ 10 GB hosting storage
- ✅ 360 MB/day bandwidth (~10 GB/month)
- ✅ Custom domain (free)
- ✅ SSL certificate (free)
- ✅ Global CDN (free)

**Estimated cost for small club: $0/month** 🎉

---

That's it! Your website is now production-ready with CDN, SSL, and optimal performance! 🚀
