import Joi from 'joi';

function validate(validator, target, res, next) {
    return Joi.validate(target, validator)
        .then(() => next())
        .catch(err => res.status(400).send({
            message: err.message,
        }));
}

export function validateParams(validator) {
    return (req, res, next) => validate(validator, req.params, res, next);
}

export function validateBody(validator) {
    return (req, res, next) => validate(validator, req.body, res, next);
}
