-- Migration: Add site content editing (headshot, bio, resume, article outlet)
-- Date: 2026-10-18
-- This migration is idempotent and can be re-run safely.

-- ============================================================================
-- 1. Admins table and authorization function
-- ============================================================================

-- Table to store admin emails (server-side allowlist)
-- This replaces the client-side email check in GoogleSignIn.jsx
create table if not exists public.admins (
  email text primary key
);

-- RLS on, but no policies: anon and authenticated cannot read this table
alter table public.admins enable row level security;

-- Function to check if the current user is an admin
-- Called by RLS policies to enforce write access
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- Only anon and authenticated users can call this function
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Seed the admins table with the current allowlist from GoogleSignIn.jsx
insert into public.admins(email) values
  ('giancarloforero@gmail.com'),
  ('nikolerajgor1@gmail.com')
on conflict do nothing;

-- ============================================================================
-- 2. Add outlet column to articles
-- ============================================================================

alter table public.articles add column if not exists outlet text;

-- ============================================================================
-- 3. Site settings table (single row)
-- ============================================================================

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  headshot_url text,
  bio text,
  resume_url text,
  updated_at timestamptz not null default now()
);

-- Seed with one empty row
insert into public.site_settings (id) values (1) on conflict do nothing;

-- RLS on
alter table public.site_settings enable row level security;

-- Trigger to update the updated_at timestamp on every update
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- 4. RLS Policies
-- ============================================================================

-- Public read on site_settings (the public site fetches this)
drop policy if exists "public read site_settings" on public.site_settings;
create policy "public read site_settings" on public.site_settings
  for select using (true);

-- Admin (authenticated + allowlist) can do all on site_settings
drop policy if exists "admin write site_settings" on public.site_settings;
create policy "admin write site_settings" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- Admin can do all on articles (replaces existing permissive policies for authenticated)
-- Note: existing "Enable read access for all users" (public SELECT) is kept
drop policy if exists "admin write articles" on public.articles;
create policy "admin write articles" on public.articles
  for all using (public.is_admin()) with check (public.is_admin());

-- Admin can do all on creatives
drop policy if exists "admin write creatives" on public.creatives;
create policy "admin write creatives" on public.creatives
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- 5. Storage: new site-assets bucket and policies
-- ============================================================================

-- Create the new public bucket for site assets
insert into storage.buckets (id, name, public) values ('site-assets', 'site-assets', true)
  on conflict (id) do nothing;

-- Public read on site-assets
drop policy if exists "site-assets public read" on storage.objects;
create policy "site-assets public read" on storage.objects
  for select using (bucket_id = 'site-assets');

-- Admin write on site-assets
drop policy if exists "site-assets admin write" on storage.objects;
create policy "site-assets admin write" on storage.objects
  for all using (bucket_id = 'site-assets' and public.is_admin())
  with check (bucket_id = 'site-assets' and public.is_admin());

-- ============================================================================
-- PHASE 2 (run later, after new policies are verified):
-- Drop old permissive write policies that allowed public/authenticated uploads
-- ============================================================================

-- Uncomment and run these ONLY after the new admin-only policies are working:
/*
drop policy if exists "Allow public uploads 10a042g_0" on storage.objects;
drop policy if exists "Allow public uploads 10a042g_1" on storage.objects;
*/
