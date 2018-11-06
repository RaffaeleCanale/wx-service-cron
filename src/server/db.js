import { MongoClient } from 'mongodb';

function getUrl({ host, port, user, password, db }) {
    return `mongodb://${user}:${password}@${host}:${port}/${db}`;
}

export default (dbConfig, callback) => {
    const url = getUrl(dbConfig);

    MongoClient.connect(url, (err, db) => {
        if (err) return callback(err);

        return callback(null, db.db(dbConfig.db));
    });
};
