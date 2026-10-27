# Notes — Coding & Learning Platform

A web-based coding learning platform for students and self-learners, with programming languages and lessons organized in one place. Notes uses a structured curriculum so learners can browse topics by language and read lessons that may include explanations, code examples, lists, images, notes, and tables.

## About the Project

Notes is built for learners who want a clear, organized place to study programming fundamentals and revisit important concepts. The dashboard brings available languages together, while each language is organized into topics. Learners can open a topic directly and follow the lesson content in a consistent reading layout.

The application is built with React and Supabase. Language lists, topics, and lesson content are stored in the database and displayed by reusable page components.

## 🎯 Who It's For

- **BCA and MCA students** looking for organized programming study material.
- **Beginners learning to code** who want to explore programming languages and concepts topic by topic.
- **Self-learners** who need a convenient place to revisit explanations and code examples.
- **Learners preparing for coursework or revision** who benefit from content grouped by language and subject.

## ✨ What You Can Do

- **Explore programming languages** from a central dashboard.
- **Browse topics by language** using structured navigation.
- **Read lesson content** with supported content blocks such as headings, paragraphs, code, lists, images, notes, tables, and dividers.
- **Create an account and sign in** to access account-protected areas.
- **Recover account access** through the password-reset flow.
- **Send a message** through the Contact page.
- **Access content on a responsive interface** designed around shared dashboard and lesson layouts.

The curriculum currently includes content areas for **C, C++, Java, PHP, HTML, CSS, JavaScript, and Bootstrap**. The depth of available lessons depends on the content entered in the database.

## 💡 Benefits for Learners

- **Easier topic discovery:** Find learning material through language and topic navigation.
- **More focused revision:** Return to a specific lesson instead of searching through unrelated material.
- **Code alongside explanations:** Supported lesson blocks can combine written concepts with code examples and other learning aids.
- **Consistent learning experience:** Shared page layouts make lessons easier to navigate across the platform.
- **Content that can grow:** Languages, topics, and lesson material are database-driven, so the curriculum can be expanded through Supabase without creating a separate React page for every lesson.

## 🛠️ Built With

- **Frontend:** React.js and JavaScript
- **Routing:** React Router
- **Backend services and database:** Supabase
- **Authentication:** Supabase Auth integration
- **Styling and UI:** CSS, Bootstrap, Font Awesome
- **Deployment:** GitHub Pages
- **Version control:** Git and GitHub

## 🌐 Project Links

- **Live application:** https://amanjaina.github.io/Notes/
- **Source code:** https://github.com/AmanJainA/Notes

## 🚀 Run Locally

### Requirements

- Node.js and npm
- A Supabase project with the Notes schema configured

### Setup

```bash
git clone https://github.com/AmanJainA/Notes.git
cd Notes
cp .env.example .env
```

Add your Supabase project URL and anon key to `.env` using the variable names shown in `.env.example`, then run:

```bash
npm install
npm start
```

Open http://localhost:3000 in your browser.

For the database setup and sample curriculum, use the SQL files in the `supabase/` directory. Make sure the `notes` schema is exposed through the Supabase Data API and that the project's authentication and Row Level Security settings are configured correctly.

## 📚 Curriculum Content

The application reads curriculum data from Supabase. The main content tables are used to organize:

- **Languages** — the available programming language or learning area.
- **Topics** — the topics belonging to each language.
- **Topic content** — structured lesson blocks displayed by the application.

This structure makes it possible to expand the learning library by adding curriculum data, while the React application handles the shared presentation.

## 👨‍💻 Developer

**Aman Jain** — Full Stack Developer | Consultant & Data Analyst

- **GitHub:** https://github.com/AmanJainA
- **Portfolio:** https://amanjaina.github.io/Portfolio/
- **LinkedIn:** https://www.linkedin.com/in/aman-jain-269684184/

---

*Notes is an evolving learning platform. The range and depth of lessons available depend on the curriculum content currently populated in the database.*
