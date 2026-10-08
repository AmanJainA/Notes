# Migrating your old content

Your original project had files like `src/Components/Main/C-Introduction.js`
with the lesson text hardcoded inside JSX (`<h3>`, `<p>`, `<ol>`, `<img>`,
etc). To move a topic like that into Notes:

## Step 1 — find the content, ignore the boilerplate

In every old file, skip everything above `return (` — that's all the
sidebar/header/footer plumbing the new `Layout.js` already handles. You
only need what's between the `<article>` tags.

## Step 2 — map each JSX tag to a content block

| Old JSX | New JSON block |
|---|---|
| `<h3>...</h3>` | `{"type": "heading", "text": "..."}` |
| `<p>...</p>` | `{"type": "paragraph", "text": "..."}` |
| `<ol><li>...</li></ol>` | `{"type": "list", "ordered": true, "items": ["...", "..."]}` |
| `<ul><li>...</li></ul>` | `{"type": "list", "ordered": false, "items": ["...", "..."]}` |
| `<img src={x} />` | `{"type": "image", "src": "https://...", "alt": "..."}` |
| `<pre><code>...</code></pre>` | `{"type": "code", "language": "c", "code": "..."}` |
| `<hr />` | `{"type": "divider"}` |

## Step 3 — worked example

**Before** (`C-Introduction.js`, trimmed to the content):

```jsx
<h1>Introduction</h1>
<p className="lead">What is C programming?</p>
<p>C is a general-purpose programming language...</p>
<hr />
<h3>History of C Language</h3>
<p>The base or father of programming languages is 'ALGOL'...</p>
<img src={history} alt="C Language History" />
<hr />
<h3>Where is C used? Key Applications</h3>
<ol>
  <li>'C' language is widely used in embedded systems.</li>
  ...
</ol>
```

**After** (a row in `topic_content.content`):

```json
[
  { "type": "paragraph", "text": "What is C programming?" },
  { "type": "paragraph", "text": "C is a general-purpose programming language..." },
  { "type": "divider" },
  { "type": "heading", "text": "History of C Language" },
  { "type": "paragraph", "text": "The base or father of programming languages is 'ALGOL'..." },
  { "type": "image", "src": "https://<your-project>.supabase.co/storage/v1/object/public/images/history.png", "alt": "C Language History" },
  { "type": "divider" },
  { "type": "heading", "text": "Where is C used? Key Applications" },
  { "type": "list", "ordered": true, "items": [
    "'C' language is widely used in embedded systems.",
    "..."
  ]}
]
```

You can insert this with SQL (same pattern as `supabase/02_seed.sql`,
targeting `notes.topic_content`) or paste it directly into the `content`
column via the Supabase Table Editor — just make sure you're editing the
table under the **`notes`** schema, not `public` (use the schema dropdown
at the top of the Table Editor).

## Step 4 — move your images

Upload the images from `src/Images/data/` to **Supabase Storage**
(create a public bucket called `images`), then use the public URL Supabase
gives each file in your `image` blocks instead of a local `import`.

## Step 5 — repeat for every old file

There's no automated converter here since the wording is your own
educational content and worth reviewing as you go — but the mapping table
above covers close to 100% of what's in your old files (they're almost
entirely `h1/h3`, `p`, `ol/ul`, `img`, and the occasional `pre/code`
block for sample programs).
