# CareerOS

Your career, managed like a product.

CareerOS is a responsive recruiting command center for students. It combines application tracking, interview preparation, deadlines, match scoring, and career analytics in one focused workspace.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Authentication

Authentication uses Supabase Auth with email/password, Google, Microsoft, and Apple providers.

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and add the project URL and publishable key.
3. In Supabase Authentication, enable Email, Google, Azure (Microsoft), and Apple.
4. Add `http://localhost:3000/auth/callback` and your production `https://<domain>/auth/callback` to the redirect allow list.
5. Add the same environment variables in Vercel and set `NEXT_PUBLIC_SITE_URL` to the production URL.

Provider secrets belong in Supabase, not in this repository or Vercel's public environment variables.

## Deploy on Vercel

Import this GitHub repository in Vercel, add the three variables from `.env.example`, and deploy. The project uses standard Next.js scripts and requires no custom build command.
