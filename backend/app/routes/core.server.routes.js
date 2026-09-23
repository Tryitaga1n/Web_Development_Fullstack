const controller = require('../controllers/core.server.controllers');
const { requireAuth } = require('../lib/auth');

module.exports = (app) => {
    app.get('/categories', controller.getCategories);
    app.get('/search', controller.search);
    app.post('/item', requireAuth, controller.createItem);
    app.get('/item/:item_id', controller.getItem);
    app.post('/item/:item_id/bid', requireAuth, controller.addBid);
    app.get('/item/:item_id/bid', controller.getBidHistory);
};
