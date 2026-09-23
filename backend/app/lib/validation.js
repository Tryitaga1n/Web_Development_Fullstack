const Joi = require('joi');

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

const addUserSchema = Joi.object({
    first_name: Joi.string().trim().min(1).max(50).required(),
    last_name: Joi.string().trim().min(1).max(50).required(),
    email: Joi.string().trim().email().max(254).required(),
    password: Joi.string().min(8).max(32).pattern(passwordPattern).required()
}).unknown(false);

const loginSchema = Joi.object({
    email: Joi.string().trim().email().max(254).required(),
    password: Joi.string().min(1).max(254).required()
}).unknown(false);

const addItemSchema = Joi.object({
    name: Joi.string().trim().min(1).max(120).required(),
    description: Joi.string().trim().min(1).max(2000).required(),
    starting_bid: Joi.number().integer().positive().required(),
    end_date: Joi.number().integer().positive()
        .custom((value, helpers) => value > Date.now()
            ? value
            : helpers.message('"end_date" must be in the future'))
        .required(),
    category_ids: Joi.array().items(Joi.number().integer().positive()).unique().optional()
}).unknown(false);

const addBidSchema = Joi.object({
    amount: Joi.number().integer().positive().required()
}).unknown(false);

const addQuestionSchema = Joi.object({
    question_text: Joi.string().trim().min(1).max(1000).required()
}).unknown(false);

const answerQuestionSchema = Joi.object({
    answer_text: Joi.string().trim().min(1).max(2000).required()
}).unknown(false);

const searchSchema = Joi.object({
    q: Joi.string().trim().max(120).allow('').optional(),
    status: Joi.string().valid('BID', 'OPEN', 'ARCHIVE').optional(),
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).default(0),
    category_id: Joi.number().integer().positive().optional(),
    category: Joi.number().integer().positive().optional()
});

const validate = (schema, value) => schema.validate(value, {
    abortEarly: true,
    convert: true,
    stripUnknown: false
});

module.exports = {
    addUserSchema,
    loginSchema,
    addItemSchema,
    addBidSchema,
    addQuestionSchema,
    answerQuestionSchema,
    searchSchema,
    validate
};
