import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import { Router } from 'express';
import { getLogger } from 'js-utils/logger';

const logger = getLogger(`${__dirname}${__filename}`);

function getModules() {
    const normalizedPath = path.join(__dirname, '.');
    const modules = [];

    fs.readdirSync(normalizedPath).forEach((key) => {
        if (key.endsWith('.js') && key !== 'index.js') {
            const file = path.join(__dirname, key);
            // eslint-disable-next-line
            modules.push(require(file).default);
        }
    });

    return modules;
}

function safe(fn) {
    try {
        return Promise.resolve(fn());
    } catch (error) {
        return Promise.reject(error);
    }
}

function wrap(endpointFn) {
    return (req, res) => safe(() => endpointFn(req, res))
        .then(v => res.status(200).send(v))
        .catch((err) => {
            logger.error(err);
            if (process.env.NODE_ENV === 'dev') {
                logger.error(`Trace: ${err.stack}`);
            }
            if (err.httpCode) {
                return res.status(err.httpCode).send({ message: err.message });
            }
            return res.status(500).send({ message: err.message });
        });
}

function endpoint(router, routePath, ...routes) {
    for (let i = 0; i < routes.length - 1; i += 1) {
        router.use(routePath, routes[i]);
    }

    _.forEach(routes[routes.length - 1], (fn, key) => {
        if (_.isArray(fn)) {
            fn[fn.length - 1] = wrap(fn[fn.length - 1]);
        } else {
            fn = wrap(fn);
        }
        router[key](routePath, fn);
    });
}

export default (context) => {
    const router = Router();
    const apiEndpoint = endpoint.bind(null, router);

    getModules().forEach(m => m(apiEndpoint, context));

    return router;
};
