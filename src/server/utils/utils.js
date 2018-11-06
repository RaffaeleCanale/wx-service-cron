import _ from 'lodash';

export function pickWithDefaults(data, defaults) {
    const pickedData = _.pick(data, _.keys(defaults));
    return _.defaults(pickedData, defaults);
}

export function initFields(target, data, defaults) {
    _.assign(target, pickWithDefaults(data, defaults));
}
