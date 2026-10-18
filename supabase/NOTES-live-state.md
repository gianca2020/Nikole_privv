# Phase 0: Live Supabase State (2026-10-18)

Captured from the production Supabase project before applying the site-content migration.

## RLS Status

Both `articles` and `creatives` tables have RLS enabled (inferred from the presence of policies).

`site_settings` table does not exist yet.

## Articles Policies (existing)

| Name | Command | Permissive | Roles | Qual | With Check |
|------|---------|-----------|-------|------|-----------|
| Admins can delete articles | DELETE | PERMISSIVE | {authenticated} | (auth.jwt() ->> 'email':text) = ANY (ARRAY['giancarloforero@...'] | - |
| Admins can insert articles | INSERT | PERMISSIVE | {authenticated} | NULL | - |
| Admins can update articles | UPDATE | PERMISSIVE | {authenticated} | (auth.jwt() ->> 'email':text) = ANY (ARRAY['giancarloforero@...'] | - |
| Enable read access for all users | SELECT | PERMISSIVE | {public} | true | - |

## Creatives Policies (existing)

| Name | Command | Permissive | Roles | Qual | With Check |
|------|---------|-----------|-------|------|-----------|
| Allow delete for authenticated users | DELETE | PERMISSIVE | {authenticated} | true | - |
| Allow inserts from admin app | INSERT | PERMISSIVE | {anon} | NULL | - |
| Authenticated can insert creatives | INSERT | PERMISSIVE | {authenticated} | NULL | - |
| Authenticated read creatives | SELECT | PERMISSIVE | {authenticated} | true | - |
| Public read creatives | SELECT | PERMISSIVE | {anon} | true | - |

## Storage Policies (Images bucket, existing)

| Name | Command | Permissive | Roles | Qual | With Check |
|------|---------|-----------|-------|------|-----------|
| Allow public reads 10a042g_0 | SELECT | PERMISSIVE | {public} | true | NULL |
| Allow public uploads 10a042g_0 | INSERT | PERMISSIVE | {public} | NULL | true |
| Allow public uploads 10a042g_1 | SELECT | PERMISSIVE | {public} | true | NULL |

## Column Types

**articles:**
- id: uuid
- title: text
- description: text
- date: date
- image_url: text
- created_at: timestamp with time zone
- is_published: boolean
- is_highlight: boolean
- link: text
- category: text
- name: text (legacy, not used by public site)

**creatives:**
- id: uuid
- title: text
- role_description: text
- link: text
- img_url: text
- created_at: timestamp with time zone

## Storage

**Images bucket:**
- Name: `Images`
- Public: true
- Size limit: Unset (50 MB default)
- Allowed MIME types: Any

Current policies allow public reads and public uploads, which is insecure once Nikole has write access through the admin app. The migration tightens this to admin-only writes.

## Notes for Migration

1. The migration will add an `admins` table and seed it with the two emails from `GoogleSignIn.jsx`.
2. Existing permissive policies on `articles` and `creatives` for authenticated/anon users are being replaced with admin-only ones.
3. The old policies on the Images bucket that allow public uploads will be commented out in Phase 2 (after verifying the new ones work).
4. A new `site-assets` bucket is created. The `Images` bucket and its existing policies are left untouched to avoid breaking existing article images.
