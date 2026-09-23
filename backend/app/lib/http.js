const asyncHandler = (handler) => (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
};

const validationError = (error) => ({
    error_message: error && error.details && error.details[0]
        ? error.details[0].message
        : 'Invalid request'
});

module.exports = { asyncHandler, validationError };
