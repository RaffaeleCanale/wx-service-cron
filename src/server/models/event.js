import _ from 'lodash';
import Joi from 'joi';

import Rule, { RuleValidator } from 'server/models/rule';
// import { initFields } from 'server/utils/utils';

export const EventValidator = Joi.object().required().keys({
    message: Joi.object().required(),
    rule: RuleValidator.required(),
    binding: Joi.string().required(),
});

export default class Event {

    static serialize(event) {
        return event.toJSON();
    }

    constructor(id, data) {
        this._id = id;
        this.rule = new Rule(data.rule);
        this.message = data.message;
        this.binding = data.binding;
    }

    get id() {
        return this._id;
    }

    timeUntilNextTick() {
        return this.rule.timeUntilNextTick();
    }

    toJSON() {
        return {
            id: this.id,
            rule: this.rule.toJSON(),
            message: this.message,
            binding: this.binding,
        };
    }
}
