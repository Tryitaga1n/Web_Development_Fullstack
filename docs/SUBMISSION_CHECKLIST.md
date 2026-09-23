# Final Submission Checklist

## Required zip contents

1. `backend/` with all API source code.
2. `frontend/` with all Vue source code.
3. `screencast.mp4`, approximately five minutes long.
4. Optional supporting documentation from `docs/`.

## Before creating the zip

- [ ] Stop both development servers.
- [ ] Run `cd backend && npm run wipe && npm test` and confirm all 128 tests pass.
- [ ] Run `cd frontend && npm run build` and confirm the production build succeeds.
- [ ] Start the backend, run `npm run seed`, and confirm the general marketplace demo data appears in the frontend.
- [ ] Record the screencast using `docs/SCREENCAST_SCRIPT.md`.
- [ ] Save the final video as `Auctionary/screencast.mp4`.
- [ ] Check that the video is playable and under the Moodle upload limit.
- [ ] Remove or exclude `node_modules/`.
- [ ] Remove or exclude `backend/db.sqlite`.
- [ ] Remove or exclude frontend `dist/`.
- [ ] Do not include `.env` files or editor-specific settings.
- [ ] Run `./scripts/package-submission.sh`.
- [ ] Inspect the zip contents with `zipinfo`.
- [ ] Back up the final zip before uploading it to Moodle.

## Marking coverage

### Back-end - 45%

- Complete OpenAPI endpoint coverage
- Strict validation and correct status codes
- Provided SQLite database and taught Express architecture
- Official tests pass without modifications

### Front-end functionality - 30%

- Every user-facing API workflow is available
- Authentication state is persisted across refreshes
- Search, filters, pagination, bidding and questions are integrated with the live API
- Category filtering and local drafts cover the extension requirements

### User experience - 15%

- Consistent responsive brand and navigation
- Bootstrap layout framework plus custom design system
- Labels, keyboard focus, skip link, semantic headings and live notifications
- Loading, empty, validation and error states throughout

### Extension tasks - 10%

- Profanity filter for items and questions
- Multi-category support for items, creation and search
- Local draft create, view, edit and delete workflow
