
import { getLogger } from 'js-utils/logger';
import moment from 'moment-timezone';

const log = getLogger('cron.scheduler');

function logSchedule(event, time) {
    const date = moment(Date.now() + time);
    // console.log('moment.tz', moment.tz);
    log.info(`Scheduled event ${date.fromNow()}`, {
        eventId: event.id,
        utcTime: date.utc().format(),
        localTime: date.tz(moment.defaultZone.name).format(),
    });
}

export default class Scheduler {

    constructor(eventConsumer) {
        this.eventConsumer = eventConsumer;
        this._scheduledEvents = new Map();
    }

    scheduleEvents(events) {
        events.forEach(event => this.scheduleEvent(event));
    }

    scheduleEvent(event) {
        if (this._scheduledEvents.has(event.id)) {
            log.warn('Rescheduling existing event', { eventId: event.id });
            this.unscheduleEvent(event);
        }

        const time = event.timeUntilNextTick();
        if (time && time > 0) {
            logSchedule(event, time);
            const schedule = setTimeout(this._triggerEvent.bind(this, event), time);
            this._scheduledEvents.set(event.id, schedule);
        }
    }

    unscheduleEvent(event) {
        const currentSchedule = this._scheduledEvents.get(event.id);
        if (currentSchedule) {
            log.info('Unscheduling event', { eventId: event.id });
            clearTimeout(currentSchedule);
            this._scheduledEvents.delete(event.id);
        }
    }

    _clearSchedules() {
        this._scheduledEvents.values().forEach(clearTimeout);
        this._clearSchedules.clear();
    }

    _triggerEvent(event) {
        log.info('Triggering event', { eventId: event.id });

        this._scheduledEvents.delete(event.id);

        this.eventConsumer.consume(event);

        this.scheduleEvent(event);
    }

}
