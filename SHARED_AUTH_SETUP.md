# Shared LifeHub + Notes account setup

Both applications use **one account/profile table: `notes.profiles`**.

## What is stored in `notes.profiles`
- `id` — same UUID as the secure Supabase Auth account
- email, full name, username, avatar
- `email_confirmed` and `confirmed_at` — synchronized automatically from Auth
- `notes_enabled` / `lifehub_enabled` — app access switches
- `is_admin` — administrator flag; `amanjain033@gmail.com` is automatically admin
- `signup_app` — Notes/LifeHub/legacy
- `account_status` — active/blocked/pending
- `last_login_at`, `last_logout_at`, `login_count`

## Important security point
The password is **not** stored in `notes.profiles` and must never be stored there. Supabase Auth keeps the password hash and session securely in `auth.users`. The Auth screens are not exposed as a separate UI/database area to your users; your React forms call Auth in the background.

## SQL order
1. Run `Notes/supabase/01_schema.sql`.
2. Run `Notes/supabase/03_unified_profiles_and_admin.sql`.
3. Run `LifeHub/supabase/schema.sql`.
4. Run `LifeHub/supabase/02_unified_profiles.sql` if you already had an older `public.profiles` table and want to migrate those records.

## SMTP
Keep your existing Supabase custom SMTP configuration exactly as it is. Signup confirmation, resend confirmation, forgot-password and password-reset emails continue to be sent through that configured SMTP provider.

## Supabase dashboard
Expose the `notes` schema under **Project Settings → Data API → Exposed schemas**. Email provider remains enabled.
