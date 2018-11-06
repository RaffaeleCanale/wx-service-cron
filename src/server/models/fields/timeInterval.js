import Joi from 'joi';
import moment from 'moment';

export const TimeIntervalValidator = Joi.object().keys({
    interval: Joi.number().positive().required(),
    unit: Joi.string().required().valid([
        'years',
        'months',
        'weeks',
        'days',
        'hours',
        'minutes',
        'seconds',
    ]),
});

export default class TimeInterval {

    constructor({ interval, unit }) {
        this.interval = interval;
        this.unit = unit;
    }

    remainder(time) {
        return moment(time).diff(moment(0), this.unit) % this.interval;
    }

    matches(time) {
        return this.remainder(time) === 0;
    }

    nextTick(startTime) {
        const toAdd = this.interval - this.remainder(startTime);
        return moment(startTime).add(toAdd, this.unit).utc().format();
    }

    toJSON() {
        return {
            interval: this.interval,
            unit: this.unit,
        };
    }

}
