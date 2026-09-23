const sqlite3 = require('sqlite3').verbose();

const DBSOURCE = 'db.sqlite';

const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    }

    console.log('Connected to the SQLite database.');
});

db.configure('busyTimeout', 5000);

db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON');

    db.run(`CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        salt TEXT NOT NULL,
        session_token TEXT UNIQUE,
        CONSTRAINT email_unique UNIQUE (email),
        CONSTRAINT token_unique UNIQUE (session_token)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS items (
        item_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        starting_bid INTEGER NOT NULL,
        start_date INTEGER NOT NULL,
        end_date INTEGER NOT NULL,
        creator_id INTEGER NOT NULL,
        FOREIGN KEY (creator_id) REFERENCES users(user_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS bids (
        item_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        timestamp INTEGER NOT NULL,
        PRIMARY KEY (item_id, user_id, amount),
        FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS questions (
        question_id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        answer TEXT,
        asked_by INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        FOREIGN KEY (asked_by) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS categories (
        category_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS item_categories (
        item_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        PRIMARY KEY (item_id, category_id),
        FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
    )`);

    const categories = [
        'Vinyl Records',
        'Turntables',
        'Audio Equipment',
        'Accessories',
        'Collectibles',
        'Box Sets'
    ];

    db.run('CREATE INDEX IF NOT EXISTS idx_items_creator ON items (creator_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_items_end_date ON items (end_date)');
    db.run('CREATE INDEX IF NOT EXISTS idx_bids_user ON bids (user_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_questions_item ON questions (item_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_item_categories_category ON item_categories (category_id)');

    categories.forEach((name) => {
        db.run('INSERT OR IGNORE INTO categories (name) VALUES (?)', [name]);
    });
});

module.exports = db;
