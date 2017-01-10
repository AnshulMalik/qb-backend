const flock = require('flockos');
const fs = require('fs');
const Bson = require('bson').Long;
const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const ObjectId = require('mongodb').ObjectID;

flock.setAppId(config.flock.appId);
flock.setAppSecret(config.flock.appSecret);


class User {

    constructor() {
        require('../api/db').then((db) => {
            this.db = db;
        }).catch((err) => {
            console.log('Error occured while requiring database', err);
        });
    }

    exists(id) {
        console.log(id, typeof id);
        return new Promise((resolve, reject) => {
            this.db.collection('users').findOne({
                _id: id
            }, (err, result) => {
                resolve(result);
            });
        });
    }
}

module.exports = new User();
