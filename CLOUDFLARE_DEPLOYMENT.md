# 🚀 Leo Sportz Club - Cloudflare Pages Deployment Guide

## Overview
Deploy your Next.js app to Cloudflare Pages with custom domain `www.leosportzclub.com`

---

## Part 1: Fix Current Auth Error (Do This First!)

### 🚨 Immediate Fix for `auth/unauthorized-domain` Error

**Step-by-Step:**

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Select your Leo Badminton/Sportz Club project

2. **Navigate to Authentication**
   - Click **"Authentication"** in left sidebar
   - Click **"Settings"** tab
   - Scroll to **"Authorized domains"** section

3. **Add Your Domains**
   Click **"Add domain"** and add each of these:
   ```
   shuttle-club.preview.emergentagent.com
   localhost
   127.0.0.1
   ```
   
   Click **"Add"** after each one.

4. **Wait & Test**
   - Wait 1-2 minutes for Firebase to propagate changes
   - Refresh your preview site: https://leo-badminton-1.preview.emergentagent.com
   - Try signing in with Google - should work now! ✅

---

## Part 2: Deploy to Cloudflare Pages

### Prerequisites
- ✅ Cloudflare account (free: https://dash.cloudflare.com/sign-up)
- ✅ Domain registered with Cloudflare or nameservers pointed to Cloudflare
- ✅ Git repository (GitHub, GitLab, or Bitbucket)

---

## Option A: Deploy via Cloudflare Dashboard (Easiest)

### Step 1: Push Code to Git Repository

If not already done:
```bash
cd /app
git init
git add .
git commit -m "Leo Sportz Club - Initial commit"
git remote add origin YOUR_GIT_REPO_URL
git push -u origin main
```

### Step 2: Connect to Cloudflare Pages

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com
   - Click **"Pages"** in left sidebar
   - Click **"Create a project"**

2. **Connect Git Repository**
   - Click **"Connect to Git"**
   - Authorize Cloudflare to access your repository
   - Select your repository

3. **Configure Build Settings**
   ```
   Project name: leo-sportz-club
   Production branch: main
   Build command: yarn build
   Build output directory: .next
   Root directory: /
   ```

4. **Set Environment Variables**
   Click **"Add variable"** for each:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
   MONGO_URL=your_mongo_url_here
   DB_NAME=your_db_name_here
   NODE_VERSION=18
   ```

5. **Click "Save and Deploy"**
   - Cloudflare will build and deploy your app
   - You'll get a URL like: `leo-sportz-club.pages.dev`

---

## Option B: Deploy via Wrangler CLI (Advanced)

### Step 1: Install Wrangler
```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare
```bash
wrangler login
```

### Step 3: Create wrangler.toml
Create `/app/wrangler.toml`:
```toml
name = "leo-sportz-club"
compatibility_date = "2024-01-01"

[site]
bucket = ".next"

[build]
command = "yarn build"

[env.production]
vars = { NODE_ENV = "production" }
```

### Step 4: Deploy
```bash
cd /app
wrangler pages deploy .next --project-name=leo-sportz-club
```

---

## Step 3: Configure Custom Domain (www.leosportzclub.com)

### A. If Domain is Already on Cloudflare:

1. **In Cloudflare Pages Dashboard**
   - Go to your project: **leo-sportz-club**
   - Click **"Custom domains"** tab
   - Click **"Set up a custom domain"**

2. **Add Your Domain**
   - Enter: `www.leosportzclub.com`
   - Click **"Continue"**
   - Cloudflare will automatically configure DNS

3. **Add Root Domain (Optional)**
   - Also add: `leosportzclub.com`
   - Set up redirect from `leosportzclub.com` → `www.leosportzclub.com`

### B. If Domain is NOT on Cloudflare:

1. **Transfer Nameservers**
   At your domain registrar (GoDaddy, Namecheap, etc.):
   - Change nameservers to Cloudflare's (provided when you add domain)
   - Wait 24-48 hours for DNS propagation

2. **Add DNS Records**
   In Cloudflare DNS settings:
   ```
   Type: CNAME
   Name: www
   Target: leo-sportz-club.pages.dev
   Proxy: On (Orange cloud)
   
   Type: CNAME
   Name: @
   Target: leo-sportz-club.pages.dev
   Proxy: On (Orange cloud)
   ```

3. **Enable HTTPS**
   - Cloudflare automatically provisions SSL certificate
   - Usually ready within 15 minutes
   - Force HTTPS in SSL/TLS settings: **"Full"** mode

---

## Step 4: Update Firebase Auth (Critical!)

After deployment, add your Cloudflare domains to Firebase:

1. **Go to Firebase Console**
   - https://console.firebase.google.com
   - Select your project

2. **Add Cloudflare Domains**
   Authentication → Settings → Authorized domains:
   ```
   www.leosportzclub.com
   leosportzclub.com
   leo-sportz-club.pages.dev
   shuttle-club.preview.emergentagent.com
   localhost
   ```

3. **Save and Wait**
   - Wait 1-2 minutes
   - Test authentication on your new domain

---

## Step 5: Configure Next.js for Cloudflare (If Needed)

Cloudflare Pages supports Next.js with some limitations. Create `/app/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['customer-assets.emergentagent.com'],
    unoptimized: true, // Cloudflare has its own image optimization
  },
  // For Cloudflare compatibility
  experimental: {
    runtime: 'nodejs',
  },
}

module.exports = nextConfig
```

---

## Automatic Deployments

Once connected to Git:
- **Every push to main branch** → Automatic production deployment
- **Pull requests** → Automatic preview deployments
- **Rollback** → One-click in Cloudflare dashboard

---

## Performance Optimizations

### 1. Enable Cloudflare Speed Features
In Cloudflare Dashboard → Speed:
- ✅ Auto Minify (HTML, CSS, JS)
- ✅ Brotli compression
- ✅ Rocket Loader
- ✅ HTTP/3 (QUIC)

### 2. Configure Caching Rules
Page Rules → Create Page Rule:
```
URL: www.leosportzclub.com/images/*
Cache Level: Cache Everything
Edge Cache TTL: 1 month
```

### 3. Enable Argo Smart Routing (Optional - Paid)
- Speeds up dynamic content delivery
- ~$5/month + $0.10/GB

---

## Monitoring & Analytics

### Cloudflare Web Analytics (Free)
1. Go to **Analytics** → **Web Analytics**
2. Add your site
3. Add tracking code (optional - Cloudflare tracks without code too)

### Cloudflare Logs (Optional - Paid)
- Real-time logs
- Security analytics
- Performance insights

---

## Troubleshooting

### Build Fails on Cloudflare?

**Error: "Build command failed"**
```bash
# Check build locally first
cd /app
yarn install
yarn build

# If successful locally, issue is with Cloudflare config
# Check environment variables are set correctly
```

**Error: "Module not found"**
- Ensure all dependencies in `package.json`
- Check `NODE_VERSION` environment variable is set to 18

### Custom Domain Not Working?

**DNS Issues:**
```bash
# Check DNS propagation
nslookup www.leosportzclub.com

# Should show Cloudflare IPs
```

**SSL Certificate Pending:**
- Wait up to 24 hours for SSL provisioning
- Check Cloudflare dashboard for certificate status

### Authentication Failing?

1. Check Firebase authorized domains list
2. Verify custom domain is added
3. Clear browser cache and cookies
4. Check browser console for specific error messages

---

## Cost Breakdown

### Cloudflare Pages
- **Free Tier**: 
  - 500 builds/month
  - Unlimited bandwidth
  - Unlimited sites
  - Free SSL
- **More than enough for your club!**

### Cloudflare Domain
- **~$10-15/year** (.com domain)

### Firebase
- **Spark Plan (Free)**: 
  - 50K reads/day
  - 20K writes/day
  - 1GB storage
- **Should be sufficient for club website**

### Total Estimated Monthly Cost: **$0** (on free tiers) 🎉

---

## Next Steps After Deployment

### 1. Test Everything
- [ ] Homepage loads on www.leosportzclub.com
- [ ] Google Sign-In works
- [ ] Leaderboard displays
- [ ] Community page accessible
- [ ] All images loading correctly
- [ ] Mobile responsive

### 2. Set Up Monitoring
- [ ] Enable Cloudflare Analytics
- [ ] Set up uptime monitoring (UptimeRobot - free)
- [ ] Configure Firebase usage alerts

### 3. SEO & Marketing
- [ ] Submit sitemap to Google Search Console
- [ ] Add site to Bing Webmaster Tools
- [ ] Set up Google Analytics (optional)
- [ ] Add social media meta tags

### 4. Performance Optimization
- [ ] Run Lighthouse audit
- [ ] Optimize images further if needed
- [ ] Add Firestore indexes
- [ ] Fix N+1 query issues (from deployment analysis)

---

## Quick Reference Commands

```bash
# Deploy to Cloudflare Pages (CLI)
wrangler pages deploy .next --project-name=leo-sportz-club

# Build for production
yarn build

# Test production build locally
yarn start

# Check build output size
du -sh .next

# Clear Next.js cache
rm -rf .next

# Redeploy from Cloudflare dashboard
# Dashboard → Pages → Project → View deployment → Retry deployment
```

---

## Support & Resources

- **Cloudflare Docs**: https://developers.cloudflare.com/pages
- **Next.js on Cloudflare**: https://developers.cloudflare.com/pages/framework-guides/nextjs
- **Cloudflare Community**: https://community.cloudflare.com
- **Firebase Support**: https://firebase.google.com/support

---

## Summary: Your Deployment Plan

### Today (Immediate):
1. ✅ Fix Firebase auth error (add current domain)
2. ✅ Test preview site authentication works

### This Week:
1. 📦 Push code to Git repository (GitHub recommended)
2. 🚀 Deploy to Cloudflare Pages
3. 🌐 Configure custom domain (www.leosportzclub.com)
4. 🔐 Add Cloudflare domain to Firebase authorized domains
5. ✅ Test production site thoroughly

### Ongoing:
1. 📊 Monitor performance and usage
2. 🔧 Optimize based on deployment analysis warnings
3. 📈 Grow your club membership!

---

Need help with any step? Let me know where you'd like to start! 🚀
