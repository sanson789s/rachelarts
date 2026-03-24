# Rachel Arts — VTuber Portfolio Website

A Next.js 16 portfolio website for Rachel Arts featuring a Live2D character, Three.js WebGL backgrounds, a scroll-driven portfolio gallery, Supabase-powered commission requests, and a real-time chat dashboard.

## Tech Stack

- **Next.js 16** (static export) + TypeScript
- **Three.js** — animated WebGL background & 3D portfolio gallery
- **PixiJS + pixi-live2d-display** — interactive Live2D character (desktop only)
- **Framer Motion** — UI transitions
- **Supabase** — auth, database, real-time chat & commission requests
- **Tailwind CSS v4**

---

## Local Development

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase project URL and anon key

# 4. Start dev server
npm run dev
```

Visit `http://localhost:3000`.

---

## Deploying to GitHub Pages

### One-time setup (do this once per repo):

1. **Push the code** to GitHub.
2. In your repo → **Settings → Pages** → set Source to **"GitHub Actions"**.
3. Add your Supabase credentials as **GitHub Secrets** (Settings → Secrets and variables → Actions):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### After that — automatic!

Every push to `main` will automatically build and deploy the site via `.github/workflows/deploy.yml`.

> **Note:** If the repo is not at the root of your GitHub Pages domain (e.g. `username.github.io/repo-name`), add `basePath: '/repo-name'` to `next.config.ts`.

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon (public) key |

Never commit `.env.local` — it is listed in `.gitignore`.
