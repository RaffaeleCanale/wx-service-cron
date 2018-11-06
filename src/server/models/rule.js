import _ from 'lodash';
import Joi from 'joi';
import moment from 'moment-timezone';

// import { initFields } from 'utils/utils';
import TimeInterval, { TimeIntervalValidator }  from 'server/models/fields/timeInterval';
import TimeSpecific, { TimeSpecificValidator }  from 'server/models/fields/timeSpecific';

// export const DocumentValidator = Joi.object().keys({
//     filename: Joi.string().required(),
//     fileCreationDate: Joi.string().isoDate().optional(),
//     documentCreationDate: Joi.string().isoDate().optional(),
//     location: Joi.array().items(Joi.string()).required(),
//     text: Joi.string().optional(),
//     labels: LabelSetValidator,
// });

// export const FieldValidator = Joi.object().required().unknown().keys({
//     type: Joi.string().valid(['time', 'interval']),
//     value: [
//         Joi.array().items(Joi.number().required()).required(),
//         Joi.number().required(),
//     ],
// });

export const RuleValidator = Joi.array().min(1).items(TimeIntervalValidator, TimeSpecificValidator);

export default class Rule {

    constructor(data = []) {
        this.fields = data.map((field) => {
            if (_.isNumber(field.interval)) {
                return new TimeInterval(field);
            }
            return new TimeSpecific(field);
        });
    }

    nextTick(startTime, limit = 10) {
        if (limit === 0) {
            console.error('LIMIT REACHED!');
            throw new Error('Limit reached!');
        }

        const nextTicks = _.map(this.fields, (f) => {
            if (f.matches(startTime)) {
                return startTime;
            }
            return f.nextTick(startTime);
        });

        const potentialTick = _.max(nextTicks);
        if (_.every(this.fields, f => f.matches(potentialTick))) {
            return potentialTick;
        }

        return this.nextTick(potentialTick, limit - 1);
    }

    timeUntilNextTick() {
        return moment(this.nextTick()).diff();
    }

    toJSON() {
        return this.fields.map(field => field.toJSON());
    }
}
