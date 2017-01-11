const flock = require('flockos');
const fs = require('fs');
const Bson = require('bson').Long;
const config = JSON.parse(fs.readFileSync('../../config.json', 'utf-8'));
const ObjectId = require('mongodb').ObjectID;

flock.setAppId(config.flock.appId);
flock.setAppSecret(config.flock.appSecret);


class User {

    // Initiaing the class User with db as private variable.
    constructor() {
        require('../api/db').then((db) => {
            this.db = db;
        }).catch((err) => {
            console.log('Error occured while requiring database', err);
        });
    }

    // Checking if the user is already existing
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

    getUserNames(ids) {
        return new Promise((resolve, reject) => {
            let users = this.db.collection('users').find({
                _id: {
                    $in: ids
                }
            }, {'name': 1});

            if(users) {
                resolve(users.toArray())
            }
            else {
                reject("Error while fetching user names");
            }
        });
    }

    // Fetching the user details for user profile.
    // Access it using user.profile(id)
    getProfile(id) {
        return new Promise((resolve, reject) => {
            this.db.collection('users').findOne({
                _id: id
            }).then((user) => {
                user.contests = this.db.collection('contests').find({
                    userId: id
                }, (err, result) => {
                    if(err)
                        reject(err);
                    else
                        resolve(result.toArray());
                });
            });
        });
    }
}

module.exports = new User();
