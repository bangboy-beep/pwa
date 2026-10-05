# SmartQR PWA

Digital menu, WiFi access, and Google Reviews for your business.

## Tech Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
- Supabase
- Vite PWA Plugin
- Playwright (E2E tests)

## Getting Started

```bash
# Install dependencies
npm install

# Copy env file and fill in credentials
cp .env.example .env

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint

# E2E Tests
npx playwright test
```

## Deployment

### Netlify (Recommended)

Set up in Netlify Dashboard:
- **Framework Preset:** Vite
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Environment variables:** Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Vercel

Alternative deployment option:
- **Build command:** `npm run build`
- **Output directory:** `dist`

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed project structure.