# Deploying RedditLeadAI to Vercel

## Quick Deploy (5 minutes)

### Step 1: Push to GitHub

```bash
cd /Users/mac/Documents/GitHub/reddit_ai
git init
git add .
git commit -m "Initial commit: RedditLeadAI MVP"
git remote add origin https://github.com/YOUR_USERNAME/reddit-lead-ai.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your `reddit-lead-ai` repo
4. Vercel auto-detects Next.js - just click **"Deploy"**

### Step 3: Add Environment Variables

After deployment, go to **Project Settings** → **Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://czsprlynepwebxankjvg.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your full key) |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase Dashboard → Settings → API |
| `DODO_PAYMENTS_API_KEY` | From Dodo Payments Dashboard |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` (your Vercel URL) |
| `DODO_FOUNDER_PRODUCT_ID` | Your Founder plan product ID |
| `DODO_AGENCY_PRODUCT_ID` | Your Agency plan product ID |

### Step 4: Redeploy

After adding env vars, click **"Redeploy"** to apply them.

---

## Update Callbacks

### Supabase Auth Redirect

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/czsprlynepwebxankjvg/auth/url-configuration)
2. Add your Vercel URL to **Site URL**: `https://your-app.vercel.app`
3. Add to **Redirect URLs**: `https://your-app.vercel.app/auth/callback`

### Dodo Payments Webhook

1. Go to Dodo Payments Dashboard
2. Add webhook URL: `https://your-app.vercel.app/api/webhooks/dodo`
3. Subscribe to: `payment.succeeded`, `subscription.active`, `subscription.cancelled`

---

## GitHub Actions (Scraper)

The scraper runs on GitHub Actions, not Vercel. Add secrets to your repo:

1. Go to GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:

| Secret | Value |
|--------|-------|
| `SUPABASE_URL` | `https://czsprlynepwebxankjvg.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase Dashboard |
| `OPENROUTER_API_KEY` | From OpenRouter Dashboard |

The scraper will run every 15 minutes automatically.

---

## Custom Domain (Optional)

1. In Vercel → **Project Settings** → **Domains**
2. Add your domain (e.g., `redditleadai.com`)
3. Update DNS records as shown
4. Update `NEXT_PUBLIC_SITE_URL` env var
5. Update Supabase redirect URLs

---

## Verify Deployment

1. Visit `https://your-app.vercel.app`
2. Try the Magic Link login
3. Complete onboarding
4. Wait 15 minutes for first leads (or manually trigger GitHub Action)
