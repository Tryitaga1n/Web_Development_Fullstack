const users = require('../models/user.server.models');

const requireAuth = async (req, res, next) => {
    const token = req.get('X-Authorization');

    if (!token) {
        return res.sendStatus(401);
    }

    try {
        const user = await users.findByToken(token);
        if (!user) {
            return res.sendStatus(401);
        }

        req.user = user;
        return next();
    } catch (err) {
        return res.status(500).json({ error_message: 'Unable to authenticate user' });
    }
};

module.exports = { requireAuth };
