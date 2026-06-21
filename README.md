# Weblantive HQ

Your personal business operating system. Built with React + Supabase + Netlify.

---

## STEP-BY-STEP DEPLOYMENT GUIDE

### STEP 1 — Set up Supabase (your database)

1. Go to https://supabase.com and sign up (use your GitHub account)
2. Click **New Project**, name it `weblantive-hq`
3. Set a strong password — save it somewhere safe
4. Choose region: **East US**
5. Wait ~2 minutes for it to spin up
6. Go to **Settings → API** in the left sidebar
7. Copy and save:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon public key** (long string)

### STEP 2 — Create your database tables

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Open the file `supabase-setup.sql` from this project
4. Copy everything inside it and paste into the SQL editor
5. Click **Run** (green button)
6. You should see "Success. No rows returned" — tables are created

### STEP 3 — Create your login account

1. In Supabase, go to **Authentication → Users**
2. Click **Invite user** or **Add user**
3. Enter your email and a password
4. This is what you'll use to log into Weblantive HQ

### STEP 4 — Add your Supabase credentials to the app

1. Open the file: `src/lib/supabase.js`
2. Replace `YOUR_SUPABASE_URL` with your Project URL from Step 1
3. Replace `YOUR_SUPABASE_ANON_KEY` with your anon public key from Step 1
4. Save the file

### STEP 5 — Push code to GitHub

1. Go to https://github.com and create a free account if you haven't
2. Click **+** → **New repository**
3. Name it `weblantive-hq`, set to Public, check "Add a README"
4. Click **Create repository**
5. On your repo page, click **uploading an existing file**
6. Upload ALL the files from this project folder (drag and drop the whole folder)
7. Click **Commit changes**

### STEP 6 — Deploy on Netlify

1. Go to https://netlify.com and sign up with GitHub
2. Click **Add new site → Import from Git**
3. Choose **GitHub** and authorize it
4. Select your `weblantive-hq` repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click **Deploy site**
7. Wait ~2 minutes. Netlify gives you a live URL like `weblantive-hq.netlify.app`

### STEP 7 — Open your app

1. Click the Netlify URL
2. Log in with the email and password you created in Step 3
3. You're in — Weblantive HQ is live!

---

## TECH STACK

- **React** (Vite) — frontend framework
- **Supabase** — database + authentication
- **Framer Motion** — animations
- **Lucide React** — icons
- **canvas-confetti** — deal celebration 🎉
- **date-fns** — date handling
- **Netlify** — free hosting

---

## FEATURES

- Dashboard with PA greeting, daily joke, daily quote, tasks, revenue goals
- CRM Kanban board with 9 pipeline stages
- Full client profiles with project tracking
- Synced calendar + tasks
- Finance tracker (ZAR + USD) with profit calculation
- Document vault with custom categories
- SOP manager — paste and save instantly
- Full settings with theme, colors, pricing, goals
- Dark/light mode + 7 preset color themes
- Confetti when a deal is closed 💸

---

Built for Weblantive — Mulanda's web design business OS.
