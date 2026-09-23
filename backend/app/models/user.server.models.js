const crypto = require('crypto');
const db = require('../lib/database');

const HASH_ITERATIONS = 120000;
const HASH_LENGTH = 64;
const HASH_ALGORITHM = 'sha512';

const createPasswordHash = (password, salt) => crypto
    .pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_LENGTH, HASH_ALGORITHM)
    .toString('hex');

const verifyPassword = (password, salt, expectedHash) => {
    const actual = Buffer.from(createPasswordHash(password, salt), 'hex');
    const expected = Buffer.from(expectedHash, 'hex');

    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
};

const create = async ({ first_name, last_name, email, password }) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = createPasswordHash(password, salt);
    const result = await db.run(
        `INSERT INTO users (first_name, last_name, email, password, salt)
         VALUES (?, ?, ?, ?, ?)`,
        [first_name, last_name, email.toLowerCase(), hash, salt]
    );

    return { user_id: result.lastID };
};

const findByEmail = (email) => db.get(
    'SELECT * FROM users WHERE email = ?',
    [String(email).toLowerCase()]
);

const findByToken = (token) => db.get(
    `SELECT user_id, first_name, last_name, email
     FROM users WHERE session_token = ?`,
    [token]
);

const updateSessionToken = (userId, token) => db.run(
    'UPDATE users SET session_token = ? WHERE user_id = ?',
    [token, userId]
);

const clearSessionToken = (userId) => db.run(
    'UPDATE users SET session_token = NULL WHERE user_id = ?',
    [userId]
);

module.exports = {
    create,
    findByEmail,
    findByToken,
    updateSessionToken,
    clearSessionToken,
    verifyPassword
};
