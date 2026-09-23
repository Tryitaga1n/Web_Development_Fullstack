const db = require('../lib/database');

const summarySelect = `
    SELECT i.item_id, i.name, i.description, i.end_date, i.creator_id,
           u.first_name, u.last_name
    FROM items i
    JOIN users u ON u.user_id = i.creator_id
`;

const getCategories = () => db.all(
    'SELECT category_id, name FROM categories ORDER BY name ASC'
);

const getCategoriesForItem = (itemId) => db.all(
    `SELECT c.category_id, c.name
     FROM categories c
     JOIN item_categories ic ON ic.category_id = c.category_id
     WHERE ic.item_id = ?
     ORDER BY c.name ASC`,
    [itemId]
);

const attachCategories = async (items) => {
    if (!items.length) return items;

    const itemIds = items.map((item) => item.item_id);
    const placeholders = itemIds.map(() => '?').join(',');
    const rows = await db.all(
        `SELECT ic.item_id, c.category_id, c.name
         FROM item_categories ic
         JOIN categories c ON c.category_id = ic.category_id
         WHERE ic.item_id IN (${placeholders})
         ORDER BY c.name ASC`,
        itemIds
    );

    const categoriesByItem = new Map();
    rows.forEach((row) => {
        const categories = categoriesByItem.get(row.item_id) || [];
        categories.push({ category_id: row.category_id, name: row.name });
        categoriesByItem.set(row.item_id, categories);
    });

    return items.map((item) => ({
        ...item,
        categories: categoriesByItem.get(item.item_id) || []
    }));
};

const validCategoryIds = async (categoryIds = []) => {
    if (!categoryIds.length) return true;

    const placeholders = categoryIds.map(() => '?').join(',');
    const result = await db.get(
        `SELECT COUNT(*) AS count FROM categories WHERE category_id IN (${placeholders})`,
        categoryIds
    );

    return result.count === new Set(categoryIds).size;
};

const createItem = async (creatorId, item) => {
    const startDate = Date.now();
    const result = await db.run(
        `INSERT INTO items
            (name, description, starting_bid, start_date, end_date, creator_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            item.name,
            item.description,
            item.starting_bid,
            startDate,
            item.end_date,
            creatorId
        ]
    );

    if (item.category_ids && item.category_ids.length) {
        for (const categoryId of item.category_ids) {
            await db.run(
                'INSERT OR IGNORE INTO item_categories (item_id, category_id) VALUES (?, ?)',
                [result.lastID, categoryId]
            );
        }
    }

    return { item_id: result.lastID };
};

const itemExists = async (itemId) => {
    const row = await db.get('SELECT item_id FROM items WHERE item_id = ?', [itemId]);
    return Boolean(row);
};

const getItemRow = (itemId) => db.get(
    `SELECT i.item_id, i.name, i.description, i.starting_bid, i.start_date,
            i.end_date, i.creator_id, u.first_name, u.last_name
     FROM items i
     JOIN users u ON u.user_id = i.creator_id
     WHERE i.item_id = ?`,
    [itemId]
);

const getCurrentBid = (itemId) => db.get(
    `SELECT b.amount, b.timestamp, b.user_id, u.first_name, u.last_name
     FROM bids b
     JOIN users u ON u.user_id = b.user_id
     WHERE b.item_id = ?
     ORDER BY b.amount DESC, b.timestamp DESC
     LIMIT 1`,
    [itemId]
);

const getItemDetails = async (itemId) => {
    const item = await getItemRow(itemId);
    if (!item) return null;

    const currentBid = await getCurrentBid(itemId);
    const categories = await getCategoriesForItem(itemId);

    return {
        ...item,
        current_bid: currentBid ? currentBid.amount : item.starting_bid,
        current_bid_holder: currentBid ? {
            user_id: currentBid.user_id,
            first_name: currentBid.first_name,
            last_name: currentBid.last_name
        } : null,
        categories
    };
};

const getItems = async ({ q, status, userId, limit, offset, categoryId }) => {
    const where = [];
    const params = [];

    if (q) {
        where.push('LOWER(i.name) LIKE ?');
        params.push(`%${q.toLowerCase()}%`);
    }

    if (status === 'OPEN') {
        where.push('i.creator_id = ? AND i.end_date > ?');
        params.push(userId, Date.now());
    } else if (status === 'ARCHIVE') {
        where.push('i.creator_id = ? AND i.end_date <= ?');
        params.push(userId, Date.now());
    } else if (status === 'BID') {
        where.push('EXISTS (SELECT 1 FROM bids b WHERE b.item_id = i.item_id AND b.user_id = ?)');
        params.push(userId);
    }

    if (categoryId) {
        where.push('EXISTS (SELECT 1 FROM item_categories ic WHERE ic.item_id = i.item_id AND ic.category_id = ?)');
        params.push(categoryId);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const rows = await db.all(
        `${summarySelect}
         ${whereClause}
         ORDER BY i.item_id ASC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
    );

    return attachCategories(rows);
};

const addBid = (itemId, userId, amount) => db.run(
    `INSERT INTO bids (item_id, user_id, amount, timestamp)
     VALUES (?, ?, ?, ?)`,
    [itemId, userId, amount, Date.now()]
);

const getBidHistory = (itemId) => db.all(
    `SELECT b.item_id, b.amount, b.timestamp, b.user_id,
            u.first_name, u.last_name
     FROM bids b
     JOIN users u ON u.user_id = b.user_id
     WHERE b.item_id = ?
     ORDER BY b.amount DESC, b.timestamp DESC`,
    [itemId]
);

const getQuestion = (questionId) => db.get(
    `SELECT q.question_id, q.question, q.answer, q.asked_by, q.item_id,
            i.creator_id
     FROM questions q
     JOIN items i ON i.item_id = q.item_id
     WHERE q.question_id = ?`,
    [questionId]
);

const askQuestion = (itemId, userId, questionText) => db.run(
    `INSERT INTO questions (question, answer, asked_by, item_id)
     VALUES (?, NULL, ?, ?)`,
    [questionText, userId, itemId]
);

const answerQuestion = (questionId, answerText) => db.run(
    'UPDATE questions SET answer = ? WHERE question_id = ?',
    [answerText, questionId]
);

const getQuestions = (itemId) => db.all(
    `SELECT question_id, question AS question_text, answer AS answer_text
     FROM questions
     WHERE item_id = ?
     ORDER BY question_id DESC`,
    [itemId]
);

const getUserSummary = (userId) => db.get(
    `SELECT user_id, first_name, last_name
     FROM users
     WHERE user_id = ?`,
    [userId]
);

const getSellingItems = async (userId) => attachCategories(await db.all(
    `${summarySelect}
     WHERE i.creator_id = ? AND i.end_date > ?
     ORDER BY i.item_id ASC`,
    [userId, Date.now()]
));

const getBiddingItems = async (userId) => attachCategories(await db.all(
    `${summarySelect}
     WHERE i.end_date > ?
       AND EXISTS (
           SELECT 1 FROM bids b
           WHERE b.item_id = i.item_id AND b.user_id = ?
       )
     ORDER BY i.item_id ASC`,
    [Date.now(), userId]
));

const getEndedItems = async (userId) => attachCategories(await db.all(
    `${summarySelect}
     WHERE i.creator_id = ? AND i.end_date <= ?
     ORDER BY i.end_date DESC`,
    [userId, Date.now()]
));

module.exports = {
    getCategories,
    getCategoriesForItem,
    validCategoryIds,
    createItem,
    itemExists,
    getItemDetails,
    getItems,
    addBid,
    getCurrentBid,
    getBidHistory,
    getQuestion,
    askQuestion,
    answerQuestion,
    getQuestions,
    getUserSummary,
    getSellingItems,
    getBiddingItems,
    getEndedItems
};
