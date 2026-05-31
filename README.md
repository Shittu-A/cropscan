# CropScan - Crop Disease Detection Web App

AI-powered crop disease detection using Next.js, Supabase, and Hugging Face.

## Features

- 📸 Upload or capture photos of crops
- 🤖 AI-powered disease detection (38 disease classes)
- 💊 Treatment recommendations and prevention tips
- 📊 Scan history with confidence scores
- 🔗 Share results via public links
- 📱 Mobile-first responsive design

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Auth**: Supabase Auth
- **Database**: Supabase Postgres
- **Storage**: Supabase Storage
- **AI**: Hugging Face Inference API

## Setup

### 1. Clone and Install

```bash
git clone <repo-url>
cd cropscan
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `HF_API_KEY` - Your Hugging Face API token

### 3. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL in `/supabase/schema.sql` in the SQL Editor
3. Create a storage bucket called `scan-images` (private)
4. Copy your project URL and anon key to `.env.local`

### 4. Hugging Face Setup

1. Create an account at [huggingface.co](https://huggingface.co)
2. Generate an access token at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
3. Add the token to `.env.local` as `HF_API_KEY`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add the environment variables from `.env.local`
4. Deploy!

## Project Structure

```
/app
  /api
    /detect/route.ts      # HF API proxy
    /scans/route.ts       # Scan CRUD API
  /auth/page.tsx          # Login/signup
  /history/page.tsx       # Scan history
  /scan/page.tsx          # Upload & detect
  /scan/[id]/page.tsx     # Scan details
  /share/[token]/page.tsx # Public share links
  /page.tsx               # Landing page
/components               # Reusable components
/lib
  /supabase.ts           # Supabase clients
  /treatments.ts         # Disease treatment DB
/supabase/schema.sql     # Database schema
```

## Supported Crops

Apple, Blueberry, Cherry, Corn, Grape, Orange, Peach, Pepper, Potato, Raspberry, Soybean, Squash, Strawberry, Tomato (38 disease classes total)

## License

MIT
