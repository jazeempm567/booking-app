# Zahi Spa - Production Deployment Guide

## 🚀 Deploy to Railway (Best Free Option)

### Prerequisites
- GitHub account (free)
- Stripe account (free)
- Railway account (free with $5/month credit)

### Step 1: Prepare Your GitHub Repository

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ready for production deployment"

# Create a new repository on GitHub (https://github.com/new)
# Then push (replace YOUR_USERNAME and YOUR_REPO):
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### Step 2: Get Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. You'll see two pairs of keys:
   - **Test Keys**: Use for development (start with `sk_test_` and `pk_test_`)
   - **Live Keys**: Use for real payments (start with `sk_live_` and `pk_live_`)

3. **For testing**: Use test keys from your .env.production file
4. **For production**: Request Stripe account activation, then use live keys

### Step 3: Deploy on Railway

#### Option A: Via Railway Dashboard (Easiest)

1. Go to [railway.app](https://railway.app)
2. Click **"Create New Project"**
3. Select **"Deploy from GitHub"**
4. Authorize Railway to access GitHub
5. Select your repository
6. Railway automatically detects Node.js

#### Configure Environment Variables:

1. In Railway dashboard, go to your project
2. Click **"Variables"** tab
3. Add these variables:
   - **STRIPE_SECRET_KEY**: `sk_test_XXXXX...`
   - **STRIPE_PUBLISHABLE_KEY**: `pk_test_XXXXX...`
   - **NODE_ENV**: `production`
   - **PORT**: `3000` (optional, Railway sets this)

4. Click **"Deploy"**

#### Option B: Via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize Railway in your project
railway init

# Set environment variables
railway variables set STRIPE_SECRET_KEY=sk_test_XXXXX
railway variables set STRIPE_PUBLISHABLE_KEY=pk_test_XXXXX
railway variables set NODE_ENV=production

# Deploy
railway up
```

### Step 4: Get Your Live URL

After deployment:
1. In Railway dashboard, go to your project
2. Click **"Deployments"**
3. Copy your public URL (looks like: `https://yourapp-production.railway.app`)
4. This is your **live application URL**

### Step 5: Update Stripe Webhook (Optional but Recommended)

For production payments with webhook support:

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://yourapp-production.railway.app/api/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy signing secret
5. Add to Railway variables: `STRIPE_WEBHOOK_SECRET=whsec_XXXXX`

---

## Alternative Options

### Deploy to Vercel (Frontend Only)

Better for front-end static files:

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Vercel auto-detects Node.js
5. Add environment variables in Settings
6. Deploy

**Note**: Vercel has cold starts on free tier (15min timeout)

### Deploy to Render

Similar to Railway:
1. Go to [render.com](https://render.com)
2. Click "Create +" → "Web Service"
3. Connect GitHub
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables
7. Deploy free tier or use paid option

---

## After Deployment

### Test Your Live App

1. Open `https://yourapp-production.railway.app/`
2. Click "Book Now" on any service
3. Test the complete booking flow
4. Make a test payment with Stripe test card: `4242 4242 4242 4242`

### Monitor in Railway

1. Go to Railway dashboard
2. View **Logs** tab to see server output
3. Check **Metrics** for performance
4. View **Uptime** status

### Enable Auto-Deploys

In Railway:
1. Go to your project settings
2. Enable "Auto deploy on push"
3. Now every `git push` auto-deploys

---

## Database (Optional - When You Scale)

If you add bookings storage later:

### MongoDB Atlas (Free Tier)
- 512MB free database
- Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Create cluster
- Get connection string
- Add to Railway variables: `MONGODB_URI=mongodb+srv://...`

### PostgreSQL (via Railway)
- Railway includes 1GB free PostgreSQL
- Create database in Railway dashboard
- Railway auto-provides `DATABASE_URL`

---

## Domain Name (Optional - When Ready)

To use a custom domain like `zahiboking.com`:

1. Buy domain from [Namecheap](https://namecheap.com), [GoDaddy](https://godaddy.com), etc.
2. In Railway → Domain tab → Add custom domain
3. Update DNS settings at your domain registrar
4. Railway provides instructions
5. Takes 5-15 minutes to activate

---

## Stripe Configuration for Production

### Transition from Test to Live

When ready for real customers:

1. **Complete Stripe account verification**
   - Go to [Stripe Dashboard → Settings](https://dashboard.stripe.com/settings/account)
   - Submit business info
   - Wait for approval (usually 30 minutes - 2 days)

2. **Switch to Live Keys**
   - Get live keys from Stripe dashboard
   - Update Railway variables:
     - `STRIPE_SECRET_KEY=sk_live_XXXXX`
     - `STRIPE_PUBLISHABLE_KEY=pk_live_XXXXX`
   - Save → Railway auto-redeploys

3. **Update Webhook Endpoint**
   - Add live webhook to stripe dashboard
   - Update `STRIPE_WEBHOOK_SECRET` with live secret

4. **Test with real card** (use small amount)

---

## Security Checklist

- [ ] Never commit `.env.production` (it's in .gitignore)
- [ ] Use environment variables for all secrets
- [ ] Stripe webhooks enabled for payment verification
- [ ] HTTPS enforced (Railway does this automatically)
- [ ] CORS configured properly (already in your code)
- [ ] Rate limiting enabled (optional, for later)
- [ ] Backup strategy (MongoDB Atlas has backups)

---

## Troubleshooting

### App won't start
```bash
# Check error logs in Railway dashboard
# Common issues:
# - Missing environment variables
# - Port already in use
# - Node version incompatibility
```

### Payment not working
- Verify Stripe keys are correct and in env
- Test card details correct (4242 4242 4242 4242)
- Check webhook endpoint (if using webhooks)

### Images not loading
- Verify `/images/services/` path is correct
- Make sure image files are in repository
- Check browser console for 404 errors

### CORS errors
- Already configured in server.js
- If issues persist, check your frontend API endpoints

---

## Next Steps

1. **Deploy immediately**: Follow Step 1-4 above
2. **Test thoroughly**: Go through full booking flow
3. **Monitor**: Watch logs in Railway
4. **Upgrade Stripe**: When ready for real payments
5. **Add database**: When you need to store bookings permanently
6. **Custom domain**: When you go public

---

## Support Resources

- [Railway Docs](https://docs.railway.app)
- [Express.js Deployment](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Stripe API Docs](https://stripe.com/docs/api)
- [Node.js Deployment Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

---

**Ready to deploy? Start with Step 1 above!**
