const flock = require('flockos');
const fs = require('fs');
const config = require('../../config.json');
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
        return new Promise((resolve, reject) => {
            this.db.collection('users').findOne({
                _id: id
            }, (err, result) => {
                resolve(result);
            });
        });
    }

    addIfNotExist(user) {
        this.exists(user.id).then((u) => {
            if(u) {

            }
            else {
                user.contests = [];
                user['_id'] = user.id;
                delete user['id'];
                this.db.collection('users').insert(user);
            }
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
                resolve(users.toArray());
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
                resolve(user);
            }).catch((err) => {
                console.trace(err);
                reject(err);
            });
        });
    }

    checkDuplicate(username, email) {
        return new Promise((resolve, reject) => {
            let user = this.db.collection('users').findOne({
                $or: [{
                    email
                },{
                    name: username
                }]
            }).then((data) => {
                if(data == null) {
                    resolve("");
                }
                else {
                    reject("Username or email already taken");
                }
            });
        });
    }

    addContest(userId, contestId) {
        this.db.collection('users').update({
            _id: userId
        }, {
            $push: {
                contests: {
                    $each: [contestId]
                }
            }
        });
    }

    updateUser(user) {
        console.log('updating', user);
        this.db.collection('users').update({_id: user.id}, user, { upsert: true });
    }

}

module.exports = new User();
