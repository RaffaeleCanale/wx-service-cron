import Joi from 'joi';

export const idValidator = Joi.string().length(24).base64({ paddingRequired: false }).required();

export const idParamValidator = Joi.object().required().unknown().keys({
    id: idValidator,
});
