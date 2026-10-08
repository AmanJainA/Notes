-- =========================================================
-- CodeCampus - Supabase schema (custom schema: "notes")
-- Run this in: Supabase Dashboard -> SQL Editor -> New query
--
-- IMPORTANT: after running this file, go to
--   Project Settings -> Data API -> Exposed schemas
-- and add "notes" to the list (alongside "public"), then Save.
-- Supabase's API layer (PostgREST) only serves schemas that are
-- explicitly exposed there - this is a one-time dashboard step,
-- SQL alone cannot do it.
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- 0. Schema itself
-- ---------------------------------------------------------
create schema if not exists notes;

-- Let the API roles "see" the schema at all (table-level grants come below)
grant usage on schema notes to anon, authenticated, service_role;

-- Any tables created later in this schema also get sane default grants
alter default privileges in schema notes
  grant select on tables to anon, authenticated;

-- ---------------------------------------------------------
-- 1. notes.languages: C, C++, Java, PHP, HTML, CSS, JavaScript, Bootstrap...
-- ---------------------------------------------------------
create table if not exists notes.languages (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,        -- e.g. 'c', 'cpp', 'java'
  name        text not null,               -- e.g. 'C', 'C++', 'Java'
  icon        text,                        -- font-awesome class, e.g. 'fas fa-cogs'
  description text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

comment on table notes.languages is 'Top-level programming languages / tracks shown on the dashboard.';

-- ---------------------------------------------------------
-- 2. notes.topics: chapters/lessons that belong to a language
-- ---------------------------------------------------------
create table if not exists notes.topics (
  id          uuid primary key default gen_random_uuid(),
  language_id uuid not null references notes.languages(id) on delete cascade,
  slug        text not null,               -- e.g. 'introduction', 'loops'
  title       text not null,               -- e.g. 'Introduction'
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  unique (language_id, slug)
);

create index if not exists idx_topics_language_id on notes.topics(language_id);

-- ---------------------------------------------------------
-- 3. notes.topic_content: the actual lesson body, as a JSON array of
-- content blocks (heading / paragraph / code / list / image / note / table)
-- See src/components/Content/ContentRenderer.js for the block shapes.
-- ---------------------------------------------------------
create table if not exists notes.topic_content (
  id         uuid primary key default gen_random_uuid(),
  topic_id   uuid not null unique references notes.topics(id) on delete cascade,
  content    jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- keep updated_at fresh on every edit
create or replace function notes.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_topic_content_updated_at on notes.topic_content;
create trigger trg_topic_content_updated_at
  before update on notes.topic_content
  for each row execute procedure notes.set_updated_at();

-- ---------------------------------------------------------
-- 4. notes.profiles: extra info per signed-up user
-- (auth.users itself lives in the built-in "auth" schema, managed by Supabase)
-- ---------------------------------------------------------
create table if not exists notes.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  created_at timestamptz not null default now()
);

comment on table notes.profiles is
  'Visible mirror of auth.users, scoped to the notes schema, kept in sync '
  'by the on_auth_user_created trigger below. Actual login/passwords/session '
  'tokens and email sending are still handled by Supabase Auth (auth.users) '
  '- this table exists only so signups are visible where your app data lives.';

-- Auto-create/update a profile row whenever someone signs up or confirms
create or replace function notes.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = notes, public
as $$
begin
  insert into notes.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do update
    set email     = excluded.email,
        full_name = excluded.full_name;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure notes.handle_new_user();

-- ---------------------------------------------------------
-- 5. notes.user_progress: which topics a user has completed
-- ---------------------------------------------------------
create table if not exists notes.user_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  topic_id     uuid not null references notes.topics(id) on delete cascade,
  completed    boolean not null default false,
  completed_at timestamptz,
  unique (user_id, topic_id)
);

create index if not exists idx_progress_user_id on notes.user_progress(user_id);

-- ---------------------------------------------------------
-- 6. notes.contact_messages: messages submitted via the Contact page
-- ---------------------------------------------------------
create table if not exists notes.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete set null,
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_contact_user_id on notes.contact_messages(user_id);

-- =========================================================
-- 7. Table-level grants
-- (RLS below controls WHICH rows; these grants control WHICH
--  actions are even allowed on the table in the first place.)
-- =========================================================

grant select on notes.languages, notes.topics, notes.topic_content
  to anon, authenticated;

grant select, update on notes.profiles to authenticated;

grant select, insert, update on notes.user_progress to authenticated;

grant insert on notes.contact_messages to authenticated;

-- =========================================================
-- 8. Row Level Security
-- =========================================================

alter table notes.languages enable row level security;
alter table notes.topics enable row level security;
alter table notes.topic_content enable row level security;
alter table notes.profiles enable row level security;
alter table notes.user_progress enable row level security;
alter table notes.contact_messages enable row level security;

-- Course content is public read (anyone with the anon key can view lessons)
create policy "Public can read languages" on notes.languages
  for select using (true);

create policy "Public can read topics" on notes.topics
  for select using (true);

create policy "Public can read topic_content" on notes.topic_content
  for select using (true);

-- Only you (via the SQL editor / Table editor, which runs as the table
-- owner and bypasses RLS) should write lesson content, so no
-- INSERT/UPDATE policy is granted to anon/authenticated on those three
-- tables above.

-- profiles: a user can read/update only their own profile
create policy "Users can view own profile" on notes.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on notes.profiles
  for update using (auth.uid() = id);

-- user_progress: a user can read/write only their own progress rows
create policy "Users can view own progress" on notes.user_progress
  for select using (auth.uid() = user_id);

create policy "Users can insert own progress" on notes.user_progress
  for insert with check (auth.uid() = user_id);

create policy "Users can update own progress" on notes.user_progress
  for update using (auth.uid() = user_id);

-- contact_messages: any signed-in user can submit a message, but nobody
-- (aside from you, via the SQL editor / a service-role key) can read them
-- back through the API - deliberately no SELECT policy.
create policy "Users can send a contact message" on notes.contact_messages
  for insert with check (auth.uid() = user_id or user_id is null);
