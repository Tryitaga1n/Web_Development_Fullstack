const controller = require('../controllers/user.server.controllers');
const { requireAuth } = require('../lib/auth');

module.exports = (app) => {
    app.post('/users', controller.create);
    app.post('/login', controller.login);
    app.post('/logout', requireAuth, controller.logout);
    app.get('/users/:user_id', controller.getOne);
};
