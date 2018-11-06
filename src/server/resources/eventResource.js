import { ObjectId } from 'mongodb';

import _ from 'lodash';

import Event from 'server/models/event';

import { NotFound } from 'server/utils/errors';

function toEventModel(dbModel) {
    if (!dbModel) return null;

    const { _id } = dbModel;
    return new Event(_id, dbModel);
}

function toDbModel(event) {
    return _.omit(event.toJSON(), 'id');
}

export function getAll({ db }) {
    return db.collection('events').find({}).toArray()
        .then(arr => arr.map(toEventModel));
}

export function get({ db }, _id) {
    return db.collection('events').findOne({ _id: new ObjectId(_id) })
        .then(toEventModel);
}

export function create({ db }, event) {
    console.log('toDbModel(event)', toDbModel(event));
    return db.collection('events').insertOne(toDbModel(event))
        .then(({ ops }) => toEventModel(ops[0]));
}

export function update({ db }, event) {
    return db.collection('events').updateOne(
        { _id: new ObjectId(event.id) },
        { $set: toDbModel(event) }
    ).then(({ result }) => {
        if (result.n === 0) {
            throw new NotFound('Event not found');
        }
        return event;
    });
}

export function remove({ db }, _id) {
    return db.collection('events')
        .deleteOne({ _id: new ObjectId(_id) })
        .then(({ deletedCount }) => {
            if (deletedCount === 0) {
                throw new NotFound('Event not found');
            }
        });
}
