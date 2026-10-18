# Nikole Admin

A client project built for Nikole Rajgor to manage the articles and creative work
shown on her journalism portfolio. This repository contains the private-facing
administration application; the public website lives separately in
[Nikole-Rajgor](https://github.com/gianca2020/Nikole-Rajgor).

Built with React, Vite, React Router, Tailwind CSS, and Supabase.

## Local development

Use Node.js 22 (`nvm use`) and npm. From this repository's root:

```sh
npm ci
cp .env.example .env
# Fill in the public client configuration in .env.
npm run dev
```

```sh
npm run lint     # Static checks
npm run build    # Production bundle in dist/
npm run preview # Preview the production bundle locally
```

The GitHub Actions workflow runs lint and build for pushes and pull requests.
These checks do not exercise a live Supabase project or verify database policies.
Vite embeds `VITE_*` values in browser code: use the public anon key, never a
service-role key or an email-provider secret. Keep local environment files out of Git.

## Structure

- `src/pages/`: login and dashboard screens.
- `src/components/`: Google sign-in, content forms, and content management.
- `src/lib/supabase.js`: shared database and authentication client.
- `public/_redirects`: SPA fallback for static hosting.

The root Vite application is the maintained application. The unrelated nested
React Router starter has been removed.

## Service setup and deployment

Configure Supabase Google OAuth and permit the application callback URL. The
current sign-in callback is `https://nikoledata.netlify.app/dashboard`; update
that configuration deliberately when changing deployment domains.
The application expects `articles` and `creatives` tables in the associated
Supabase project. Schema migrations and access policies are not included here.
Publish `dist/` after `npm run build`, and set the public environment values in
the hosting build environment.

Review [REVIEW.md](REVIEW.md) for authorization and data-contract findings before
changing database access. No live services are changed by this repository cleanup.
