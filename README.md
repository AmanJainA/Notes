# Notes

A reusable, database-driven coding-notes platform for BCA/MCA students.
Covers **C, C++, Java, PHP, HTML, CSS, JavaScript, Bootstrap** — and adding
a new language or lesson never requires writing new React code, because
content lives in **Supabase** and is rendered by a handful of shared
components.

## Why this is "reusable"

Your old project had one `.js` file per topic (`C-Introduction.js`,
`CCPointer.js`, `PhpArray.js`, ... 100+ files), each copy-pasting the same
sidebar/header/footer code. This version has:

| Old approach | New approach |
|---|---|
| 1 file per topic, layout copy-pasted everywhere | 1 `Layout.js` used by every page |
| Lesson text hardcoded in JSX | Lesson content stored as JSON in Supabase |
| 1 file per topic content | 1 `TopicPage.js` renders **every** topic, for **every** language |
| Hardcoded sidebar links | `Sidebar.js` reads languages/topics from Supabase automatically |
| Fake `sessionStorage` login | Real Supabase Auth (signup/login/logout/reset) |

To add a whole new language (say, Python) you only need to:
1. Insert one row into the `languages` table.
2. Insert its topics into the `topics` table.
3. Insert each topic's lesson as JSON into `topic_content`.

No React code changes, no redeploy needed for content.

## Design — matches the look of your original "Notes" project

This isn't just re-styled from scratch — it reuses the actual layout
patterns, class names, and page structure from your original repo:

- **Dashboard page** — same shell as your old `Dashboard.js`: a dark
  `site-navbar` header with brand + mobile menu, language cards in an
  `image-wrap-2` hover-overlay grid, and a plain `footer` at the bottom.
- **Lesson pages** — same shell as your old topic files: an off-canvas,
  light-themed icon `sidebar-wrapper` that slides in from the left when
  toggled, lesson content in the middle, and a right-hand `Aside` topic
  list, with a mobile drawer + overlay for both — down to the exact
  `page-wrapper.toggled`, `aside-wrapper.show`, `.code-block` class names
  from your original CSS.
- **Login / Signup** — same red-panel-on-photo-background look as your
  old `Login.css`, just split into two clean routes instead of one
  radio-toggle page.

The difference is everything is now **data-driven**: the old project had
3 hardcoded language nav arrays (`cNavItems`, `cppNavItems`,
`phpNavItems`) and one file per topic. Here, `Sidebar.js` and `Aside.js`
read the language/topic list from Supabase, and `TopicPage.js` is the
one component that renders every lesson for every language — so the
same visual pattern now scales to all 8 languages without new files.

All of the distilled CSS lives in `src/theme/theme.css`.

## Project structure

```
Notes/
├── public/index.html          # Bootstrap 5 + Font Awesome via CDN
├── src/
│   ├── theme/theme.css        # Sidebar/Aside/navbar/footer/auth/dark-.Main styles, lifted from the original
│   ├── lib/supabaseClient.js  # Supabase client (uses .env vars, targets the "notes" schema)
│   ├── context/
│   │   ├── AuthContext.js     # signup/login/logout/reset
│   │   └── CurriculumContext.js # fetches languages+topics once, shares everywhere
│   ├── components/
│   │   ├── Auth/              # Login, Signup, ForgotPassword, ProtectedRoute
│   │   ├── Layout/
│   │   │   ├── DashboardLayout.js  # Header + Footer shell (dashboard/about/contact)
│   │   │   ├── LessonLayout.js     # Sidebar + Aside shell (lesson pages)
│   │   │   ├── Header.js, Footer.js, Sidebar.js, Aside.js
│   │   └── Content/ContentRenderer.js  # turns JSON blocks into JSX
│   ├── pages/
│   │   ├── Dashboard.js       # lists all languages
│   │   ├── About.js           # same About-page layout as the original
│   │   ├── Contact.js         # same Contact-page layout, now saves to Supabase
│   │   ├── LanguagePage.js    # ONE component for every language's overview
│   │   └── TopicPage.js       # ONE component for every topic of every language
│   └── App.js                 # routes
└── supabase/
    ├── 01_schema.sql          # schema "notes": tables (incl. contact_messages) + RLS policies
    └── 02_seed.sql            # 8 languages + demo lessons to prove it works
```

## 1. Set up Supabase

All app tables live in their own Postgres schema called **`notes`** (not
the default `public` schema), so your data stays cleanly separated from
anything else in the project.

1. Create a free project at [supabase.com](https://supabase.com).
2. In the dashboard, go to **SQL Editor → New query**, paste in the
   contents of `supabase/01_schema.sql`, and run it. This creates the
   `notes` schema plus every table, trigger, grant and RLS policy.
3. Do the same with `supabase/02_seed.sql` to load demo languages/topics
   and a few sample lessons (Introduction pages for C, Java, HTML,
   JavaScript, Bootstrap).
4. **Expose the schema to the API** — go to **Project Settings → Data
   API → Exposed schemas**, add `notes` to the list (keep `public` too),
   and click **Save**. Supabase's API layer only serves schemas listed
   here; skipping this step is the #1 cause of "table not found" errors.
5. Go to **Authentication → Providers** and make sure **Email** is
   enabled. (For quick testing, you can turn off "Confirm email" under
   **Authentication → Settings** so signup logs you in immediately.)
6. Go to **Project Settings → API** and copy the **Project URL** and
   **anon public key** — you'll need them next.

## 2. Run the app locally

```bash
git clone <your-new-repo-url>
cd Notes
cp .env.example .env
# edit .env and paste your Supabase URL + anon key
npm install
npm start
```

Visit `http://localhost:3000`, sign up, and you should land on the
Dashboard with 8 language cards.

## 3. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Notes"
git branch -M main
git remote add origin https://github.com/<your-username>/Notes.git
git push -u origin main
```

`.env` is already in `.gitignore` so your keys are never committed. The
Supabase **anon key** is safe to expose in a deployed frontend by design —
it only allows what your Row Level Security policies permit (public read
for lessons, private read/write for each user's own progress).

## 4. Deploy

Any static host works since this is a plain Create React App build.

**Option A — Vercel / Netlify (recommended, easiest env vars):**
1. Import the GitHub repo.
2. Set build command `npm run build`, output directory `build`.
3. Add environment variables `REACT_APP_SUPABASE_URL` and
   `REACT_APP_SUPABASE_ANON_KEY` in the host's dashboard.
4. Deploy.

**Option B — GitHub Pages (via GitHub Actions):**
1. Add `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` as
   **repository secrets** (Settings → Secrets and variables → Actions).
2. Add a workflow that runs `npm run build` with those secrets exposed as
   env vars, then deploys the `build` folder with
   `actions/deploy-pages`. Ask me and I can generate this workflow file
   for you.

## 5. Adding content (no code required)

Open **Supabase → Table Editor**:
- `languages` — add a row for a new language (slug, name, icon class, description).
- `topics` — add a row per lesson, linked to the language.
- `topic_content` — add one JSON array per topic. See
  `src/components/Content/ContentRenderer.js` for all supported block
  types (`heading`, `paragraph`, `code`, `list`, `image`, `note`, `table`,
  `divider`) and `supabase/02_seed.sql` for real examples.

## 6. Migrating your existing C/C++/PHP content

See `MIGRATION_GUIDE.md` — it explains how to turn your old hardcoded
`.js` files into `topic_content` JSON rows without losing any text or
images.

## What's intentionally left for you to finish

This is a working proof-of-concept skeleton, not the full 100+ lesson
library — that part is just data entry now, not development. To go
further:
- Migrate the remaining C/C++/PHP topics from your old repo (see
  `MIGRATION_GUIDE.md`).
- Write topics for Java, HTML, CSS, JavaScript, Bootstrap beyond
  "Introduction".
- Optionally add a syntax highlighter (e.g. `react-syntax-highlighter`)
  to the `code` block in `ContentRenderer.js` for nicer colors.
- Optionally add an admin screen inside the app for editing lessons,
  instead of using the Supabase Table Editor directly.
