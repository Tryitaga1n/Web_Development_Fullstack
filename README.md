# Nocturne Vinyl - Auctionary Full-Stack Assignment

This repository contains the complete 2026/27 Full-Stack Web Development assignment:

- `backend/`: Node.js, Express and SQLite implementation of the Auctionary API.
- `frontend/`: Vue 3 single-page application branded as **Nocturne Vinyl**, a specialist record auction house.
- `docs/`: submission checklist and a timed walkthrough for the required screencast.
- `scripts/`: a safe packaging script that excludes dependencies, build output and runtime data.

The implementation follows the official OpenAPI specification and includes all three extension tasks.

## Prerequisites

- Node.js 18 or later
- npm
- Two terminal windows

## 1. Run the backend

```bash
cd backend
npm install
npm run dev
```

The API runs at `http://localhost:3333`.

The SQLite database and tables are created automatically. To create a polished vinyl-themed demonstration dataset for the frontend and screencast, keep the server running and execute this in a second terminal:

```bash
cd backend
npm run seed
```

The seed command is safe to run more than once and creates two accounts:

```text
Seller: maya.demo@nocturne.co.uk / VinylDemo9!
Bidder: ethan.demo@nocturne.co.uk / VinylDemo8!
```

To reset the database and run the official tests instead:

```bash
npm run wipe
npm test
```

Expected result: `128 passing`.

## 2. Run the frontend

Open the second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

If the API runs somewhere else, copy `.env.example` to `.env` and change `VITE_API_URL`.

## Submitted functionality

### Back-end

- User registration, login and logout
- Salted PBKDF2 password hashing and session tokens
- User profiles with selling, bidding and ended-auction lists
- Auction creation and validation
- Bidding with seller and minimum-bid checks
- Bid history
- Buyer questions and seller answers
- Search by text, status, pagination and category
- Exact OpenAPI response fields and status codes

### Front-end

- Responsive, accessible Nocturne Vinyl branding
- Registration and login
- Search and category filtering
- Clear local vinyl-themed demonstration data via `npm run seed`
- Auction details, bid history, bidding and questions
- Seller answer workflow
- Auction creation with live preview
- User dashboard
- Loading, empty, success and error states
- Graceful handling of unauthorised and invalid requests

### Extension tasks

1. **Profanity filter**: item names, descriptions, questions and answers are filtered before storage.
2. **Categories system**: new category and join tables, seeded categories, category selection for listings and category search filtering. Items can belong to multiple categories.
3. **Local drafts**: create, save, view, edit and delete unfinished listings in browser `localStorage`; drafts are removed after publishing.

## Documentation

- [Submission checklist](docs/SUBMISSION_CHECKLIST.md)
- [Five-minute screencast script](docs/SCREENCAST_SCRIPT.md)

## Final submission build

Place the completed screencast at `Auctionary/screencast.mp4`, then run:

```bash
./scripts/package-submission.sh
```

The generated zip excludes `node_modules`, `dist`, local `.env` files and SQLite runtime data.
