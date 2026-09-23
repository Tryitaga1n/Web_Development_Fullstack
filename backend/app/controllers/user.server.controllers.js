const crypto = require('crypto');
const users = require('../models/user.server.models');
const core = require('../models/core.server.models');
const { addUserSchema, loginSchema, validate } = require('../lib/validation');
const { asyncHandler, validationError } = require('../lib/http');

const create = asyncHandler(async (req, res) => {
    const { error, value } = validate(addUserSchema, req.body);
    if (error) return res.status(400).json(validationError(error));

    const existing = await users.findByEmail(value.email);
    if (existing) {
        return res.status(400).json({ error_message: 'An account already exists for this email address' });
    }

    try {
        const result = await users.create(value);
        return res.status(201).json(result);
    } catch (err) {
        if (String(err.message).includes('UNIQUE')) {
            return res.status(400).json({ error_message: 'An account already exists for this email address' });
        }
        throw err;
    }
});

const login = asyncHandler(async (req, res) => {
    const { error, value } = validate(loginSchema, req.body);
    if (error) return res.status(400).json(validationError(error));

    const user = await users.findByEmail(value.email);
    if (!user || !users.verifyPassword(value.password, user.salt, user.password)) {
        return res.status(400).json({ error_message: 'Email address or password is incorrect' });
    }

    const token = user.session_token || crypto.randomBytes(32).toString('hex');
    if (!user.session_token) {
        await users.updateSessionToken(user.user_id, token);
    }

    return res.status(200).json({ user_id: user.user_id, session_token: token });
});

const logout = asyncHandler(async (req, res) => {
    await users.clearSessionToken(req.user.user_id);
    return res.status(200).end();
});

const getOne = asyncHandler(async (req, res) => {
    const userId = Number(req.params.user_id);
    if (!Number.isInteger(userId) || userId < 1) return res.sendStatus(404);

    const user = await core.getUserSummary(userId);
    if (!user) return res.sendStatus(404);

    const [selling, biddingOn, auctionsEnded] = await Promise.all([
        core.getSellingItems(userId),
        core.getBiddingItems(userId),
        core.getEndedItems(userId)
    ]);

    return res.status(200).json({
        ...user,
        selling,
        bidding_on: biddingOn,
        auctions_ended: auctionsEnded
    });
});

module.exports = { create, login, logout, getOne };
