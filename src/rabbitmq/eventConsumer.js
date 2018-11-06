import RabbitmqFactory from 'wx-client-rabbitmq';
import { getLogger } from 'js-utils/logger';

const log = getLogger('cron.eventConsumer');

export default class EventConsumer {

    constructor(rabbitmqConfig) {
        this.rabbitmqFactory = new RabbitmqFactory(rabbitmqConfig);
    }

    consume(event) {
        this.rabbitmqFactory.connect()
            .then(() => this._sendMessage(event))
            .then(() => this.rabbitmqFactory.close())
            .catch((err) => {
                log.error(err);
                this.rabbitmqFactory.close();
            });
    }

    _sendMessage(event) {
        log.verbose('Broadcasting message', { eventId: event.id });
        return this.rabbitmqFactory.getBroadcastEmitter('cron')
            .then(channel => channel.emit(event.message, event.binding));
    }

}
