import _ from 'lodash';
import Joi from 'joi';
import moment from 'moment';
import { contains } from 'js-utils/utils';


const DATE_FIELDS = [
    'year',
    'month',
    'day',
    'hour',
    'minute',
    'second',
];

const UNITS = {
    year: {
        momentFn: 'year',
        dateField: 'year',
    },
    month: {
        momentFn: 'month',
        dateField: 'month',
    },

    day: {
        momentFn: 'date',
        dateField: 'day',
    },
    dayOfMonth: {
        momentFn: 'date',
        dateField: 'day',
    },
    dayOfWeek: {
        momentFn: 'isoWeekday',
        dateField: 'day',
        scope: 'week',
    },

    hour: {
        momentFn: 'hour',
        dateField: 'hour',
    },
    minute: {
        momentFn: 'minute',
        dateField: 'minute',
    },
    second: {
        momentFn: 'second',
        dateField: 'second',
    },
};


export const TimeSpecificValidator = Joi.object().keys({
    unit: Joi.string().required().valid(_.keys(UNITS)),
    values: [
        Joi.array().items(Joi.number().required()).required(),
        Joi.number().required(),
    ],
});

export default class TimeSpecific {

    constructor({ values, unit }) {
        this.values = _.isArray(values) ? values : [values];

        this._unitName = unit;
        this.unit = UNITS[this._unitName];

        this._unitFieldIndex = DATE_FIELDS.indexOf(this.unit.dateField);

    }

    getValue(momentTime, unit) {
        return momentTime[(unit || this.unit).momentFn]();
    }

    setValue(momentTime, value, unit) {
        return momentTime[(unit || this.unit).momentFn](value);
    }

    // withValue(time, value) {
    //     const newDate = this._preserverParentsOnly(time);

    //     const { momentFn } = UNITS[this.unit];
    //     return newDate[momentFn](value).utc().format();
    // }

    // _preserverParentsOnly(time) {
    //     const referenceDate = moment(time);

    //     let unit = UNITS[this.unit];
    //     let newDate = moment(0);
    //     while (unit.scope) {
    //         unit = UNITS[unit.scope];
    //         const value = referenceDate[unit.momentFn]();
    //         newDate = newDate[unit.momentFn](value);
    //     }

    //     return newDate;
    // }

    // incrementParent(time) {
    //     const { scope } = UNITS[this.unit];
    //     if (!scope) {
    //         return null;
    //     }

    //     return moment(time).add(1, scope);
    //     // const parentValue = parent.fn(moment(time));
    //     // return parent.fn(moment(time), parentValue + 1);
    // }

    matches(time) {
        return contains(this.values, this.getValue(moment(time)));
    }

    nextTick(startTime) {
        let result = moment(startTime);

        result = this._clampLowerFields(result);
        result = this._setNextValue(result);

        return result.utc().format();

        // const value = this.getValue(startTime);
        // let nextValue = _.min(this.values.filter(v => v > value));
        // if (!nextValue) {
        //     startTime = this.incrementParent(startTime);
        //     nextValue = _.min(this.values);

        //     if (!startTime) {
        //         return null;
        //     }
        // }

        // return this.withValue(startTime, nextValue);
    }

    _clampLowerFields(momentTime) {
        for (let i = this._unitFieldIndex + 1; i < DATE_FIELDS.length; i += 1) {
            const field = DATE_FIELDS[i];
            const unit = UNITS[field];
            momentTime = this.setValue(momentTime, 0, unit);
        }

        return momentTime;
    }

    _setNextValue(momentTime) {
        const currentValue = this.getValue(momentTime);

        let nextValue = _.min(this.values.filter(v => v > currentValue));
        if (!nextValue) {
            nextValue = _.min(this.values);
            momentTime = this._overflow(momentTime);
            if (!momentTime) {
                return null;
            }
        }

        return this.setValue(momentTime, nextValue);
    }

    _overflow(momentTime) {
        if (this._unitFieldIndex === 0) {
            return null;
        }

        const parentField = this.unit.scope || DATE_FIELDS[this._unitFieldIndex - 1];
        return momentTime.add(1, `${parentField}s`);
    }

    toJSON() {
        return {
            values: this.values,
            unit: this._unitName,
        };
    }
}

