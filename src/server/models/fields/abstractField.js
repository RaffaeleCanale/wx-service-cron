export default class Field {

    constructor(value) {
        this.value = value;
    }

    nextTick(startTime) {
        if (this.matches(startTime)) {
            return startTime;
        }

        return this._nextTick(startTime);
    }

    matches(time) {
        if (this.value === null || this.value === undefined) {
            return true;
        }

        return this._matches(time);
    }

}