-- =========================================================
-- CodeCampus - demo seed data (schema: "notes")
-- Run AFTER 01_schema.sql, in the SQL Editor.
-- Proves the reusable architecture: 8 languages, each with topics,
-- rendered by the exact same React components.
-- =========================================================

insert into notes.languages (slug, name, icon, description, sort_order) values
  ('c',          'C',          'fas fa-microchip',   'The foundation of modern programming.', 1),
  ('cpp',        'C++',        'fas fa-cogs',         'C with classes: OOP, STL and more.', 2),
  ('java',       'Java',       'fab fa-java',         'Write once, run anywhere.', 3),
  ('php',        'PHP',        'fab fa-php',          'Server-side scripting for the web.', 4),
  ('html',       'HTML',       'fab fa-html5',        'The structure of every web page.', 5),
  ('css',        'CSS',        'fab fa-css3-alt',     'Styling and layout for the web.', 6),
  ('javascript', 'JavaScript', 'fab fa-js',           'The language of interactive web pages.', 7),
  ('bootstrap',  'Bootstrap',  'fab fa-bootstrap',    'Build responsive UIs fast.', 8)
on conflict (slug) do nothing;

-- ---- C topics ----
insert into notes.topics (language_id, slug, title, sort_order)
select id, t.slug, t.title, t.sort_order
from notes.languages, (values
  ('introduction', 'Introduction', 1),
  ('data-types',   'Data Types',   2),
  ('loops',        'Loops',        3)
) as t(slug, title, sort_order)
where languages.slug = 'c'
on conflict (language_id, slug) do nothing;

-- ---- C++ topics ----
insert into notes.topics (language_id, slug, title, sort_order)
select id, t.slug, t.title, t.sort_order
from notes.languages, (values
  ('introduction', 'Introduction', 1),
  ('oops',         'OOP Concepts', 2)
) as t(slug, title, sort_order)
where languages.slug = 'cpp'
on conflict (language_id, slug) do nothing;

-- ---- Java topics ----
insert into notes.topics (language_id, slug, title, sort_order)
select id, t.slug, t.title, t.sort_order
from notes.languages, (values
  ('introduction', 'Introduction', 1),
  ('data-types',   'Data Types',   2)
) as t(slug, title, sort_order)
where languages.slug = 'java'
on conflict (language_id, slug) do nothing;

-- ---- PHP topics ----
insert into notes.topics (language_id, slug, title, sort_order)
select id, t.slug, t.title, t.sort_order
from notes.languages, (values
  ('introduction', 'Introduction', 1),
  ('variables',    'Variables',    2)
) as t(slug, title, sort_order)
where languages.slug = 'php'
on conflict (language_id, slug) do nothing;

-- ---- HTML topics ----
insert into notes.topics (language_id, slug, title, sort_order)
select id, t.slug, t.title, t.sort_order
from notes.languages, (values
  ('introduction', 'Introduction', 1),
  ('tags',         'Common Tags',  2)
) as t(slug, title, sort_order)
where languages.slug = 'html'
on conflict (language_id, slug) do nothing;

-- ---- CSS topics ----
insert into notes.topics (language_id, slug, title, sort_order)
select id, t.slug, t.title, t.sort_order
from notes.languages, (values
  ('introduction', 'Introduction', 1),
  ('selectors',    'Selectors',    2)
) as t(slug, title, sort_order)
where languages.slug = 'css'
on conflict (language_id, slug) do nothing;

-- ---- JavaScript topics ----
insert into notes.topics (language_id, slug, title, sort_order)
select id, t.slug, t.title, t.sort_order
from notes.languages, (values
  ('introduction', 'Introduction', 1),
  ('functions',    'Functions',    2)
) as t(slug, title, sort_order)
where languages.slug = 'javascript'
on conflict (language_id, slug) do nothing;

-- ---- Bootstrap topics ----
insert into notes.topics (language_id, slug, title, sort_order)
select id, t.slug, t.title, t.sort_order
from notes.languages, (values
  ('introduction', 'Introduction', 1),
  ('grid-system',  'Grid System',  2)
) as t(slug, title, sort_order)
where languages.slug = 'bootstrap'
on conflict (language_id, slug) do nothing;


-- =========================================================
-- Sample lesson content (proves the ContentRenderer works
-- for every language using the exact same block format)
-- =========================================================

-- C > Introduction
insert into notes.topic_content (topic_id, content)
select t.id, $$[
  {"type":"heading","text":"What is C programming?"},
  {"type":"paragraph","text":"C is a general-purpose, procedural programming language that is simple, fast and machine-independent. It has been used to build everything from operating systems to databases and compilers."},
  {"type":"paragraph","text":"C is often called the base of programming - once you understand C, other languages such as C++, Java and even Python become much easier to pick up, because they borrow heavily from its syntax and concepts."},
  {"type":"divider"},
  {"type":"heading","text":"Where is C used?"},
  {"type":"list","ordered":false,"items":[
    "Embedded systems and firmware",
    "Operating system kernels (parts of Windows, Linux, macOS)",
    "Databases such as MySQL",
    "Compilers and interpreters"
  ]},
  {"type":"divider"},
  {"type":"heading","text":"Your first C program"},
  {"type":"code","language":"c","filename":"hello.c","code":"#include <stdio.h>\n\nint main() {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}"},
  {"type":"note","variant":"tip","title":"Try it yourself","text":"Compile with gcc hello.c -o hello and run ./hello to see the output."}
]$$::jsonb
from notes.topics t join notes.languages l on l.id = t.language_id
where l.slug = 'c' and t.slug = 'introduction'
on conflict (topic_id) do nothing;

-- Java > Introduction
insert into notes.topic_content (topic_id, content)
select t.id, $$[
  {"type":"heading","text":"What is Java?"},
  {"type":"paragraph","text":"Java is a class-based, object-oriented language designed to run anywhere via the Java Virtual Machine (JVM) - the 'write once, run anywhere' idea."},
  {"type":"heading","text":"Your first Java program"},
  {"type":"code","language":"java","filename":"Hello.java","code":"public class Hello {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}"},
  {"type":"note","variant":"info","text":"Every Java file's public class name must match the filename exactly."}
]$$::jsonb
from notes.topics t join notes.languages l on l.id = t.language_id
where l.slug = 'java' and t.slug = 'introduction'
on conflict (topic_id) do nothing;

-- HTML > Introduction
insert into notes.topic_content (topic_id, content)
select t.id, $$[
  {"type":"heading","text":"What is HTML?"},
  {"type":"paragraph","text":"HTML (HyperText Markup Language) describes the structure of a web page using elements like headings, paragraphs, links and images."},
  {"type":"code","language":"html","filename":"index.html","code":"<!DOCTYPE html>\n<html>\n  <head>\n    <title>My Page</title>\n  </head>\n  <body>\n    <h1>Hello, World!</h1>\n  </body>\n</html>"}
]$$::jsonb
from notes.topics t join notes.languages l on l.id = t.language_id
where l.slug = 'html' and t.slug = 'introduction'
on conflict (topic_id) do nothing;

-- JavaScript > Introduction
insert into notes.topic_content (topic_id, content)
select t.id, $$[
  {"type":"heading","text":"What is JavaScript?"},
  {"type":"paragraph","text":"JavaScript is the scripting language of the web - it makes pages interactive by running directly in the browser (and, via Node.js, on servers too)."},
  {"type":"code","language":"javascript","filename":"script.js","code":"function greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet(\"World\"));"}
]$$::jsonb
from notes.topics t join notes.languages l on l.id = t.language_id
where l.slug = 'javascript' and t.slug = 'introduction'
on conflict (topic_id) do nothing;

-- Bootstrap > Introduction
insert into notes.topic_content (topic_id, content)
select t.id, $$[
  {"type":"heading","text":"What is Bootstrap?"},
  {"type":"paragraph","text":"Bootstrap is a free, open-source CSS framework that provides a responsive 12-column grid plus ready-made components (buttons, navbars, cards) so you can build good-looking UIs quickly."},
  {"type":"code","language":"html","filename":"index.html","code":"<link href=\"https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css\" rel=\"stylesheet\">\n\n<button class=\"btn btn-primary\">Click me</button>"}
]$$::jsonb
from notes.topics t join notes.languages l on l.id = t.language_id
where l.slug = 'bootstrap' and t.slug = 'introduction'
on conflict (topic_id) do nothing;

-- Note: only "introduction" topics are seeded with content above so you
-- can see the app working end-to-end immediately. Add the rest of the
-- lessons the same way (or migrate your old .js files - see
-- MIGRATION_GUIDE.md in the repo root).
