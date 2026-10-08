-- UNIFIED AUTH/PROFILE MIGRATION
-- Supabase Auth maintains only the internal credential/session record required for password auth, sessions, and confirmation emails.
-- The application-facing account record is notes.profiles. NEVER store plaintext passwords here.

create schema if not exists notes;
grant usage on schema notes to anon, authenticated, service_role;

create table if not exists notes.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  username text,
  avatar text default '🙂',
  email_confirmed boolean not null default false,
  confirmed_at timestamptz,
  notes_enabled boolean not null default false,
  lifehub_enabled boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  last_login_at timestamptz,
  last_logout_at timestamptz,
  login_count integer not null default 0,
  signup_app text,
  account_status text not null default 'active' check (account_status in ('active','blocked','pending'))
);

alter table notes.profiles add column if not exists username text;
alter table notes.profiles add column if not exists avatar text default '🙂';
alter table notes.profiles add column if not exists email_confirmed boolean not null default false;
alter table notes.profiles add column if not exists confirmed_at timestamptz;
alter table notes.profiles add column if not exists notes_enabled boolean not null default false;
alter table notes.profiles add column if not exists lifehub_enabled boolean not null default false;
alter table notes.profiles add column if not exists is_admin boolean not null default false;
alter table notes.profiles add column if not exists last_login_at timestamptz;
alter table notes.profiles add column if not exists last_logout_at timestamptz;
alter table notes.profiles add column if not exists login_count integer not null default 0;
alter table notes.profiles add column if not exists signup_app text;
alter table notes.profiles add column if not exists account_status text not null default 'active';

-- Backfill existing Auth users into the single profile table.
insert into notes.profiles (id, email, full_name, username, email_confirmed, confirmed_at, notes_enabled, lifehub_enabled, is_admin, signup_app)
select u.id, u.email, split_part(u.email, '@', 1),
       split_part(u.email, '@', 1),
       u.email_confirmed_at is not null, u.email_confirmed_at, false, false, lower(u.email) = 'amanjain033@gmail.com', 'legacy'
from auth.users u
on conflict (id) do update set email = excluded.email, email_confirmed = excluded.email_confirmed, confirmed_at = excluded.confirmed_at;

create or replace function notes.handle_new_user()
returns trigger language plpgsql security definer set search_path = notes, public as $$
begin
  insert into notes.profiles (id, email, full_name, username, email_confirmed, confirmed_at, notes_enabled, lifehub_enabled, is_admin, signup_app)
  values (new.id, new.email, split_part(new.email, '@', 1),
          split_part(new.email, '@', 1), new.email_confirmed_at is not null, new.email_confirmed_at,
          true, true, lower(new.email) = 'amanjain033@gmail.com', 'notes')
  on conflict (id) do update set email=excluded.email, full_name=coalesce(excluded.full_name, notes.profiles.full_name),
    username=coalesce(excluded.username, notes.profiles.username), email_confirmed=excluded.email_confirmed, confirmed_at=excluded.confirmed_at,
    notes_enabled=notes.profiles.notes_enabled or excluded.notes_enabled, lifehub_enabled=notes.profiles.lifehub_enabled or excluded.lifehub_enabled,
    is_admin=notes.profiles.is_admin or excluded.is_admin, signup_app=coalesce(notes.profiles.signup_app, excluded.signup_app);

  -- If LifeHub has already been installed, keep the same Auth account represented
  -- in public.profiles as well. No password or credential data is copied.
  IF to_regclass('public.profiles') IS NOT NULL THEN
    EXECUTE $sql$
      INSERT INTO public.profiles
        (id,email,full_name,username,email_confirmed,confirmed_at,public_enabled,is_admin,signup_app)
      VALUES
        ($1,$2,$3,$4,$5,$6,true,$7,'notes')
      ON CONFLICT (id) DO UPDATE SET
        email=EXCLUDED.email,
        email_confirmed=EXCLUDED.email_confirmed,
        confirmed_at=EXCLUDED.confirmed_at,
        is_admin=public.profiles.is_admin OR EXCLUDED.is_admin
    $sql$ USING new.id,new.email,split_part(new.email,'@',1),split_part(new.email,'@',1),
      new.email_confirmed_at IS NOT NULL,new.email_confirmed_at,lower(new.email)='amanjain033@gmail.com';
  END IF;
  return new;
end; $$;

create or replace function notes.sync_auth_user_to_profile()
returns trigger language plpgsql security definer set search_path = notes, public as $$
begin
  update notes.profiles set email=new.email, email_confirmed=new.email_confirmed_at is not null, confirmed_at=new.email_confirmed_at where id=new.id;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure notes.handle_new_user();
drop trigger if exists on_auth_user_updated_profile on auth.users;
create trigger on_auth_user_updated_profile after update of email, email_confirmed_at on auth.users for each row execute procedure notes.sync_auth_user_to_profile();

create or replace function notes.record_profile_login()
returns trigger language plpgsql security definer set search_path=notes, public as $$
begin
  if new.email_confirmed_at is not null and (old.email_confirmed_at is null or old.updated_at <> new.updated_at) then
    update notes.profiles set email=new.email, email_confirmed=true, confirmed_at=new.email_confirmed_at where id=new.id;
  end if;
  return new;
end; $$;

create or replace function notes.is_admin() returns boolean language sql stable security definer set search_path=notes, public as $$
  select exists(select 1 from notes.profiles p where p.id=auth.uid() and (p.is_admin or lower(p.email)='amanjain033@gmail.com'));
$$;

alter table notes.profiles enable row level security;
drop policy if exists "profile own select" on notes.profiles;
create policy "profile own select" on notes.profiles for select to authenticated using (auth.uid()=id or notes.is_admin());
drop policy if exists "profile own insert" on notes.profiles;
create policy "profile own insert" on notes.profiles for insert to authenticated with check (auth.uid()=id);
drop policy if exists "profile own update" on notes.profiles;
create policy "profile own update" on notes.profiles for update to authenticated using (auth.uid()=id or notes.is_admin()) with check (auth.uid()=id or notes.is_admin());
drop policy if exists "profile admin delete" on notes.profiles;
create policy "profile admin delete" on notes.profiles for delete to authenticated using (notes.is_admin());

-- Only the admin profile can write curriculum.
drop policy if exists "admin manages languages" on notes.languages;
create policy "admin manages languages" on notes.languages for all to authenticated using (notes.is_admin()) with check (notes.is_admin());
drop policy if exists "admin manages topics" on notes.topics;
create policy "admin manages topics" on notes.topics for all to authenticated using (notes.is_admin()) with check (notes.is_admin());
drop policy if exists "admin manages topic_content" on notes.topic_content;
create policy "admin manages topic_content" on notes.topic_content for all to authenticated using (notes.is_admin()) with check (notes.is_admin());

-- Grants required for the authenticated admin UI. RLS still limits writes to the admin.
grant select, insert, update, delete on notes.languages, notes.topics, notes.topic_content to authenticated;
grant select, insert, update, delete on notes.profiles to authenticated;

-- Route/page activity is separate from account credentials and does not replace profiles.
create table if not exists notes.page_visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references notes.profiles(id) on delete set null,
  username text, page_name text, page_url text, device text, browser text, operating_system text, ip_address text,
  visit_time timestamptz not null default now()
);
alter table notes.page_visits enable row level security;
drop policy if exists "users can log page visits" on notes.page_visits;
create policy "users can log page visits" on notes.page_visits for insert to anon, authenticated with check (user_id is null or auth.uid()=user_id);
drop policy if exists "admin reads page visits" on notes.page_visits;
create policy "admin reads page visits" on notes.page_visits for select to authenticated using (notes.is_admin());
grant insert, select on notes.page_visits to anon, authenticated;
