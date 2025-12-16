# Short-flix — Mini Netflix-style app

Tech: Next.js 14 + TypeScript, React 18.2.0. Backend: Next.js API routes (in-memory). No Tailwind/PostCSS used.
Project structure is mono-repo: `pages` contains frontend + `/api/shorts` API. Search, tag filter, like (localStorage) and POST /api/shorts implemented.
Advanced QC: strict TypeScript, ESLint, `next build` verification and Node native tests (`node --test`) included in CI script.
Improvements with more time: add persistent DB, production-ready streaming, pagination server-side, and E2E tests.
