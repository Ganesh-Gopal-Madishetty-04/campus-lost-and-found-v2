# Campus Lost & AI Found: Project Overview

A web app where college students report lost and found items, search existing reports, get matched with likely items by an AI/matching engine, and receive email alerts. Built the traditional way: our own code and our own backend, in VS Code, with GitHub Copilot as an assistant. No Lovable, no Supabase.

---

## 1. What the frontend report actually tells us

Read this before building, because it changes what we can assume.

- **It is a plan, not proof of a working app.** Almost every feature is marked "target", "planned" or "verify current UI". Nothing is confirmed built.
- **The backend never connected.** The report admits a "supabaseUrl is required" error. Since we are dropping Supabase, delete that package and any Supabase code from the frontend.
- **Stack claim to verify.** The report says React + Vite. If her actual code is plain HTML/CSS/JS, the report is wrong and must be corrected before it is submitted anywhere. Open her `frontend` branch and check for `package.json`, `vite.config.js` and a `src/` folder.
- **Her categories differ from ours.** She lists Electronics, ID Cards, Books & Notes, Bags, Clothing, Keys, Accessories, Other. Our agreed list is: Water bottles & food items, ID cards & important cards, Electronics, Study material, Sports items, Bags & personal items, Other/unknown. Pick one list and use it everywhere (see section 5).
- **Missing from the report:** the QR ID-card scan, an admin/moderation role, and any real details about the AI matching.
- **Good ideas worth keeping:** the claim-request workflow (don't expose ownership details publicly), Lost/Found shown as text plus colour, empty states instead of fake sample data, college-email restriction, and never trusting frontend-only checks.
- **The report says the backend is "handled separately by a teammate".** That is now us. Both of you must agree on one API contract (section 6) before writing code.

---

## 2. Features

**MVP (build first, in this order)**
1. Sign up / log in with college email and password (name and email stored in profile)
2. Create a Lost or Found report: title, category, description, approximate location, date, photo
3. Browse, search and filter reports (category, Lost/Found, text)
4. Report detail page
5. My reports (dashboard) with an empty state and the ability to mark an item "returned"
6. Claim request: a claimant sends a message or proof; the reporter approves or rejects

**Phase 2**
7. Matching engine: score lost vs found reports and show "possible matches"
8. Email alerts when a likely match appears or a claim is received
9. Admin/moderator view

**Phase 3 (stretch)**
10. QR scan for ID cards
11. Smarter AI matching (text embeddings, image similarity)
12. Deployment

---

## 3. Proposed tech stack

Chosen because you both know only C so far: one language across the whole project, minimal setup, and all of it understood by Copilot.

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite (if Manogna's code already uses it; otherwise decide once) | Component-based, matches her report |
| Backend | Node.js + Express | Same language (JavaScript) as the frontend |
| Database | SQLite via `better-sqlite3` | A single file, no server to install, works on Linux and Windows. Can move to PostgreSQL later |
| Auth | `bcrypt` for password hashes + JWT tokens | The standard simple approach |
| Image upload | `multer`, files saved in `/uploads` | Local storage, no cloud account |
| Email | `nodemailer` with SMTP (Gmail app password for testing) | Free to start |
| Matching v1 | Rule-based scoring in JS | Explainable and testable |
| Matching v2 | Text similarity (TF-IDF or embeddings) | Add after v1 works |
| QR scan | `html5-qrcode` in the browser | Phase 3 |
| Tools | Git, GitHub, VS Code, Copilot, Postman or Thunder Client | |

**Honest trade-off:** local SQLite and local image files are great for development, but many free hosts wipe the disk on restart. For real deployment you will need a persistent disk or PostgreSQL plus cloud image storage. Decide that in Phase 3, not now.

---

## 4. Architecture

```
Browser (React UI)
      │  HTTP + JSON (fetch/axios), JWT in Authorization header
      ▼
Express API  ──►  SQLite database
      │      ──►  /uploads (images)
      │      ──►  Matching service (function, later a job)
      └──────►  Email service (nodemailer)
```

Rules:
- The frontend never talks to the database. It only calls the API.
- All security checks (who can edit or claim what, email domain) happen in the backend.
- Secrets live in `.env` files, never in Git.

---

## 5. Data model (starting point)

**users**: id, name, email (unique), password_hash, role (`student` | `admin`), created_at

**reports**: id, user_id, type (`lost` | `found`), title, category, description, location_text, event_date, image_path, status (`open` | `claimed` | `returned`), created_at

**claims**: id, report_id, claimant_id, message, status (`pending` | `approved` | `rejected`), created_at

**matches**: id, lost_report_id, found_report_id, score, reasons, notified (0/1), created_at

**notifications**: id, user_id, type, message, read, created_at

Categories (single shared list, store as a fixed set of values): `bottles_food`, `id_cards`, `electronics`, `study_material`, `sports`, `bags_personal`, `other`.

Privacy rule: public views of a report must not show the reporter's email. Contact only happens through the claim flow.

---

## 6. API contract (agree on this first)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create account (checks college email domain) |
| POST | `/api/auth/login` | Returns JWT |
| GET | `/api/auth/me` | Current user |
| GET | `/api/reports?type=&category=&q=` | List/search/filter |
| POST | `/api/reports` | Create report (multipart form with image) |
| GET | `/api/reports/:id` | Detail |
| PATCH | `/api/reports/:id` | Owner updates or marks returned |
| GET | `/api/reports/mine` | My reports |
| POST | `/api/reports/:id/claims` | Submit claim |
| PATCH | `/api/claims/:id` | Reporter approves/rejects |
| GET | `/api/reports/:id/matches` | Possible matches |
| GET | `/api/notifications` | My alerts |

Keep the real KMIT email domain in an environment variable (`ALLOWED_EMAIL_DOMAIN`). Confirm it from the college, do not guess it.

---

## 7. Folder structure

```
campus-lost-and-found/
├── frontend/          # React + Vite (Manogna)
│   └── src/ components/ pages/ api/ styles/
├── backend/           # Express API (you)
│   ├── src/ routes/ controllers/ middleware/ db/ services/
│   ├── uploads/       # gitignored
│   └── .env           # gitignored
├── docs/              # this file, API contract, report
└── README.md
```

---

## 8. Work split and branches

- **You (Linux Mint):** `backend` branch: database, auth, reports API, matching, email.
- **Manogna (Windows):** `frontend` branch: UI, forms, API calls using the contract above.
- Merge into `main` through pull requests, each reviewed by the other person.
- Until the backend is ready, the frontend can use a small `api/` module returning fake data. Remove it once real endpoints exist.
- Note the different operating systems: use forward slashes in paths, commit a `.gitignore` early, and set `git config core.autocrlf` appropriately on the Windows machine to avoid line-ending noise.

---

## 9. Build phases

| Phase | Goal | Done when |
|---|---|---|
| 0 | Decide stack, confirm frontend code, clean out Supabase/Lovable leftovers, set up folders and `.gitignore` | Both can run frontend and backend locally |
| 1 | Auth | Register, log in, `/me` works from the UI |
| 2 | Reports | Create with photo, list, filter, detail |
| 3 | Dashboard + claims | Claim approve/reject works between two accounts |
| 4 | Matching v1 + email alerts | Test lost/found pair triggers an email |
| 5 | Polish | Validation, responsive layout, accessibility, empty states, security review |
| 6 | Stretch | QR scan, smarter AI matching, deployment |

---

## 10. Matching v1 (simple, explainable)

For each new report, compare against open reports of the opposite type:
- same category: strong signal
- keyword overlap in title and description (ignore common words)
- location text similarity
- dates close together (found date on or after lost date)

Combine into a score from 0 to 100; show matches above a threshold, with the reasons. Always label results as "possible match", and let a human verify ownership through the claim flow.

---

## 11. Working with Copilot (so it helps instead of hurting)

- Give it this file and the API contract as context. Ask for one small feature at a time.
- Read every generated block and make sure you can explain it. Neither of you knows JavaScript yet, and code you can't explain is code you can't debug at demo time.
- Commit after every working step. If Copilot breaks something, you can roll back.
- Never paste `.env` contents or passwords into Copilot chat.
- Hash passwords, validate file types and sizes, and check user permissions in the backend on every route. Verify Copilot actually did these.
- Write down the decisions that affect both of you (category list, field names, API shapes) in `docs/`.

---

## 12. Open decisions

1. Is Manogna's frontend really React + Vite or plain HTML/CSS/JS? Choose one and keep it.
2. Final category list (section 5 recommended).
3. Official college email domain.
4. Email provider for alerts.
5. Where it will be demonstrated or deployed (local demo vs hosted).
6. Are claims reviewed by the reporter, an admin, or both?
