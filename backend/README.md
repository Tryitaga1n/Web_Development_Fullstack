# Auctionary API

Express and SQLite implementation of the official Auctionary OpenAPI specification.

## Commands

```bash
npm install
npm run dev
npm run seed
npm run wipe
npm test
```

- `npm run dev` starts the API on port `3333`.
- `npm run seed` creates a reusable general-marketplace demonstration dataset for the frontend.
- `npm run wipe` empties the test database and resets all auto-increment counters.
- `npm test` runs the provided acceptance tests. The completed implementation passes all 128 tests.

## Structure

- `server.js`: application and middleware setup.
- `database.js`: SQLite schema, including category extension tables.
- `app/routes/`: endpoint definitions.
- `app/controllers/`: request validation and response handling.
- `app/models/`: parameterised database operations.
- `app/lib/`: authentication, validation, profanity filtering and database helpers.
- `tests/`: unchanged official test suite and fixture data.

## Security notes

- Passwords use salted PBKDF2 with SHA-512 and 120,000 iterations.
- Session tokens are generated with `crypto.randomBytes(32)`.
- SQL values use prepared statements.
- Request bodies are validated with strict Joi schemas; unknown fields are rejected.
- CORS is enabled so the Vue frontend can call the API independently.
