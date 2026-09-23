const controller = require('../controllers/question.server.controllers');
const { requireAuth } = require('../lib/auth');

module.exports = (app) => {
    app.get('/item/:item_id/question', controller.getQuestions);
    app.post('/item/:item_id/question', requireAuth, controller.askQuestion);
    app.post('/question/:question_id', requireAuth, controller.answerQuestion);
};
