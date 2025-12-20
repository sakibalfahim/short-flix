# Short-flix - Netflix-style mini app

[![CI](https://github.com/sakibalfahim/short-flix/actions/workflows/ci.yml/badge.svg)](https://github.com/sakibalfahim/short-flix/actions/workflows/ci.yml)
[![Tests](https://github.com/sakibalfahim/short-flix/actions/workflows/ci.yml/badge.svg?event=push)](https://github.com/sakibalfahim/short-flix/actions/workflows/ci.yml)
[![Vercel Deploy Status](https://vercel.com/sakib-al-fahims-projects/short-flix/badge)](https://vercel.com/sakib-al-fahims-projects/short-flix)

Mini demo platform for short videos built with **Next.js + TypeScript**. API routes serve an in-memory list of shorts. CI enforces type-check / lint / build / tests. Docker + Makefile included for local containerization.

---

## Live demo
> **URL:** [https://short-flix-dun.vercel.app/](https://short-flix-dun.vercel.app/)

---

## Tech stack
- Next.js 14 + TypeScript
- React 18
- No Tailwind / no PostCSS (project constraint)
- CI: GitHub Actions (type-check, lint, build, test)
- Tests: Node native `node --test`
- Dockerfile & Makefile included for reproducible runs

---

## Features
- `GET /api/shorts` - returns a list of shorts (supports `q`, `tag`, `page`, `limit`)
- `POST /api/shorts` - add a short (in-memory)
- Search, tag filter, like/favorite (localStorage)
- Interactive dark-theme NetTheme canvas background
- Strict TypeScript + ESLint + CI

---

## Quick local dev (PowerShell 7)
```powershell
# clone (if needed) and enter project
git clone https://github.com/sakibalfahim/short-flix.git
cd short-flix

# install dependencies (Node v20.x)
npm ci

# start dev server
npm run dev

# separate checks
npm run type-check
npm run lint
npm run build
npm test

---

## Docker (build + run)

```bash
# build
docker build -t short-flix:latest .

# run (exposes port 3000)
docker run --rm -it -p 3000:3000 short-flix:latest
# then open http://localhost:3000

---

## Vercel deploy (CI / manual)
- CI deploy is wired into `.github/workflows/ci.yml`. To enable prod deploy from Actions:

  1. Create a Vercel token (Vercel dashboard → Settings → Tokens).
  2. Add `VERCEL_TOKEN` under Repo → Settings → Secrets → Actions.
  3. Push to `master` - Actions will run and deploy.

- Manual deploy:

  ```bash
  npx vercel login
  npx vercel --prod --confirm

---

## Tests
Run all tests locally:

  ```powershell
  npm test

---

## Troubleshooting
- If linting complains about TypeScript ESLint rules: ensure `.eslintrc.json` extends `next/core-web-vitals`.
- If Vercel badge not showing, update the badge URL to match your Vercel project path.

---

## Project files of interest
`pages/`, `components/`, `styles/`, `src/lib/shorts.js`, `pages/api/shorts.ts`, `.github/workflows/ci.yml`, `Dockerfile`, `Makefile`.