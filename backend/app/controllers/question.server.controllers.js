const core = require('../models/core.server.models');
const { addQuestionSchema, answerQuestionSchema, validate } = require('../lib/validation');
const { asyncHandler, validationError } = require('../lib/http');
const { containsProfanity } = require('../lib/profanity');

const askQuestion = asyncHandler(async (req, res) => {
    const itemId = Number(req.params.item_id);
    if (!Number.isInteger(itemId) || itemId < 1) return res.sendStatus(404);

    const { error, value } = validate(addQuestionSchema, req.body);
    if (error) return res.status(400).json(validationError(error));

    const item = await core.getItemDetails(itemId);
    if (!item) return res.sendStatus(404);
    if (item.creator_id === req.user.user_id) return res.sendStatus(403);

    if (containsProfanity(value.question_text)) {
        return res.status(400).json({ error_message: 'Question contains prohibited language' });
    }

    await core.askQuestion(itemId, req.user.user_id, value.question_text);
    return res.status(200).end();
});

const answerQuestion = asyncHandler(async (req, res) => {
    const questionId = Number(req.params.question_id);
    if (!Number.isInteger(questionId) || questionId < 1) return res.sendStatus(404);

    const { error, value } = validate(answerQuestionSchema, req.body);
    if (error) return res.status(400).json(validationError(error));

    const question = await core.getQuestion(questionId);
    if (!question) return res.sendStatus(404);
    if (question.creator_id !== req.user.user_id) return res.sendStatus(403);

    if (containsProfanity(value.answer_text)) {
        return res.status(400).json({ error_message: 'Answer contains prohibited language' });
    }

    await core.answerQuestion(questionId, value.answer_text);
    return res.status(200).end();
});

const getQuestions = asyncHandler(async (req, res) => {
    const itemId = Number(req.params.item_id);
    if (!Number.isInteger(itemId) || itemId < 1) return res.sendStatus(404);
    if (!(await core.itemExists(itemId))) return res.sendStatus(404);

    const questions = await core.getQuestions(itemId);
    return res.status(200).json(questions);
});

module.exports = { askQuestion, answerQuestion, getQuestions };
