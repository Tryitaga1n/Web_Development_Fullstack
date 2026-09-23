const core = require('../models/core.server.models');
const users = require('../models/user.server.models');
const { addItemSchema, addBidSchema, searchSchema, validate } = require('../lib/validation');
const { asyncHandler, validationError } = require('../lib/http');
const { containsProfanity } = require('../lib/profanity');

const getCategories = asyncHandler(async (req, res) => {
    const categories = await core.getCategories();
    return res.status(200).json(categories);
});

const createItem = asyncHandler(async (req, res) => {
    const { error, value } = validate(addItemSchema, req.body);
    if (error) return res.status(400).json(validationError(error));

    if (containsProfanity(value.name, value.description)) {
        return res.status(400).json({ error_message: 'Auction wording contains prohibited language' });
    }

    if (!(await core.validCategoryIds(value.category_ids))) {
        return res.status(400).json({ error_message: 'One or more categories do not exist' });
    }

    const item = await core.createItem(req.user.user_id, value);
    return res.status(201).json(item);
});

const getItem = asyncHandler(async (req, res) => {
    const itemId = Number(req.params.item_id);
    if (!Number.isInteger(itemId) || itemId < 1) return res.sendStatus(404);

    const item = await core.getItemDetails(itemId);
    if (!item) return res.sendStatus(404);
    return res.status(200).json(item);
});

const addBid = asyncHandler(async (req, res) => {
    const itemId = Number(req.params.item_id);
    if (!Number.isInteger(itemId) || itemId < 1) return res.sendStatus(404);

    const { error, value } = validate(addBidSchema, req.body);
    if (error) return res.status(400).json(validationError(error));

    const item = await core.getItemDetails(itemId);
    if (!item) return res.sendStatus(404);
    if (item.creator_id === req.user.user_id) return res.sendStatus(403);
    if (Number(item.end_date) <= Date.now()) {
        return res.status(400).json({ error_message: 'Auction has closed' });
    }

    if (value.amount <= item.current_bid) {
        return res.status(400).json({ error_message: 'Bid must be greater than the current bid' });
    }

    await core.addBid(itemId, req.user.user_id, value.amount);
    return res.sendStatus(201);
});

const getBidHistory = asyncHandler(async (req, res) => {
    const itemId = Number(req.params.item_id);
    if (!Number.isInteger(itemId) || itemId < 1) return res.sendStatus(404);
    if (!(await core.itemExists(itemId))) return res.sendStatus(404);

    const history = await core.getBidHistory(itemId);
    return res.status(200).json(history);
});

const search = asyncHandler(async (req, res) => {
    const { error, value } = validate(searchSchema, req.query);
    if (error) return res.status(400).json(validationError(error));

    let userId = null;
    if (value.status) {
        const token = req.get('X-Authorization');
        const user = token ? await users.findByToken(token) : null;
        if (!user) {
            return res.status(400).json({ error_message: 'Authentication is required for this search' });
        }
        userId = user.user_id;
    }

    const items = await core.getItems({
        q: value.q,
        status: value.status,
        userId,
        limit: value.limit,
        offset: value.offset,
        categoryId: value.category_id || value.category
    });

    return res.status(200).json(items);
});

module.exports = { getCategories, createItem, getItem, addBid, getBidHistory, search };
