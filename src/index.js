import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import moment from 'moment';
import Joi from 'joi';
import bodyParser from 'body-parser';
import Logger from 'js-utils/logger';
import { rabbitmqOptionsValidator } from 'wx-client-rabbitmq/rabbitFactory';

import initializeDb from 'server/db';
import middleware from 'server/middleware';
import api from 'server/api';
import Scheduler from 'scheduler/scheduler';
import * as eventResource from 'server/resources/eventResource';
import EventConsumer from 'rabbitmq/eventConsumer';

import rootConfig from '../config.json';

moment.tz.setDefault('Europe/Zurich');

const configSchema = Joi.object().required().keys({
    config: Joi.object().required().keys({
    }),
    server: Joi.object().required().keys({
        port: Joi.number().integer().default(8080),
        bodyLimit: Joi.string().default('100kb'),
        corsHeaders: Joi.array().default(['Link']),
    }),
    db: Joi.object().required().keys({
        host: Joi.string().required(),
        port: Joi.number().integer().required(),
        user: Joi.string().required(),
        password: Joi.string().required(),
        db: Joi.string().required(),
    }),
    rabbitmq: rabbitmqOptionsValidator,
});

// export default function initialize(serverConfig) {}
const { error, value } = Joi.validate(rootConfig, configSchema);
if (error) {
    Logger.error(error);
    process.exit(1);
}
const { config, server, db, rabbitmq } = value;

const app = express();
app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors({
    exposedHeaders: server.corsHeaders,
}));

app.use(bodyParser.json({ limit: server.bodyLimit }));

// connect to db
initializeDb(db, (err, db) => {
    if (err) {
        Logger.error(err);
        process.exit(1);
    }

    const scheduler = new Scheduler(new EventConsumer(rabbitmq));

    const context = { config, db, scheduler };

    // internal middleware
    app.use(middleware(context));

    // api router
    app.use('/api', api(context));

    app.server.listen(process.env.PORT || server.port, () => {
        Logger.info(`Started on port ${app.server.address().port}`);
    });

    Logger.info('Scheduling all events');
    eventResource.getAll(context).then(events => scheduler.scheduleEvents(events));
});

export default app;
