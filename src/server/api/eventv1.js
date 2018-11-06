// import Joi from 'joi';
// import { getLogger } from 'js-utils/logger';

import { validateBody, validateParams } from 'server/middleware/validator';
import { idParamValidator } from 'server/utils/idValidator';

import * as eventResource from 'server/resources/eventResource';

import Event, { EventValidator } from 'server/models/event';

import { NotFound } from 'server/utils/errors';

function scheduleAndSerialize({ scheduler }, event) {
    scheduler.scheduleEvent(event);
    return Event.serialize(event);
}

export default (route, context) => {

    route('/events', {
        get() {
            return eventResource.getAll(context)
                .then(arr => arr.map(Event.serialize));
        },

        post: [
            validateBody(EventValidator),
            function post({ body }) {
                const event = new Event(null, body);
                return eventResource.create(context, event)
                    .then(e => scheduleAndSerialize(context, e));
            },
        ],

    });

    route('/event/:id', validateParams(idParamValidator), {
        get({ params }) {
            return eventResource.get(context, params.id)
                .then((event) => {
                    if (!event) throw new NotFound();
                    return Event.serialize(event);
                });
        },

        put: [
            validateBody(EventValidator),
            function put({ params, body }) {
                const event = new Event(params.id, body);

                return eventResource.update(context, event)
                    .then(e => scheduleAndSerialize(context, e));
            },
        ],

        delete({ params }) {
            return eventResource.remove(context, params.id)
                .then(() => {
                    context.scheduler.unscheduleEvent({ id: params.id });
                    return {};
                });
        },
    });

    route('/events', {
        get() {
            return eventResource.getAll(context)
                .then(arr => arr.map(Event.serialize));
        },

        post: [
            validateBody(EventValidator),
            function post({ body }) {
                const event = new Event(null, body);
                return eventResource.create(context, event)
                    .then(e => scheduleAndSerialize(context, e));
            },
        ],

    });

    // route('/event/:id', validateParams(idParamValidator), {

    //     get({ params }) {
    //         return eventResource.get(context, params.id)
    //             .then((event) => {
    //                 if (!event) throw new NotFound();
    //                 return Event.serialize(event);
    //             });
    //     },

    // });

    // route('/documents/file', {
    //     post: [
    //         validateBody({
    //             filename: Joi.string().required(),
    //             location: Joi.array().required(),
    //             labels: LabelSetValidator,
    //         }),
    //         async function post({ body }) {
    //             const { filename, location, labels } = body;
    //             const { filesDirectory, documentsDirectory } = context.config;

    //             if (!fileExists(filename, filesDirectory)) {
    //                 return Promise.reject(new NotFound('File does not exist'));
    //             }

    //             const { created } = getPdfFile(filesDirectory, filename);

    //             const document = new Document(null, {
    //                 filename,
    //                 fileCreationDate: created,
    //                 documentCreationDate: new Date(),
    //                 location,
    //                 labels,
    //             });

    //             document.text = await readText(document.filename, filesDirectory);
    //             const rules = await ruleResource.getAll(context);
    //             document.applyRules(rules);

    //             const result = await documentResource.create(context, document);
    //             await moveFile(document.filename, filesDirectory, documentsDirectory);

    //             return Document.serialize(result);
    //         },
    //     ],
    // });

    // route('/documents/migrations', {
    //     get() {
    //         return documentResource.getMigrations(context)
    //             .then(arr => arr.map(({ document, suggestion }) => ({
    //                 document: Document.serialize(document),
    //                 suggestion,
    //             })));
    //     },
    // });

    // route('/documents/scan/all', {
    //     post() {
    //         const logger = getLogger('scan');
    //         const { documentsDirectory } = context.config;

    //         documentResource.getAll(context)
    //             .then((documents) => {
    //                 const promises = documents.map((document) => {
    //                     logger.info('Processing', document.filename);
    //                     return readText(document.filename, documentsDirectory)
    //                         .then((text) => {
    //                             logger.info('Text size', text.length);
    //                             document.text = text;
    //                             return documentResource.update(context, document);
    //                         }).catch(err => logger.error(err));
    //                 });


    //                 return Promise.all(promises);
    //             });

    //         return Promise.resolve({});
    //     },
    // });

};
