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

    // Creating a new user
    create(obj) {
        console.log('Inserting new user');
        console.log(obj);
        return new Promise((resolve, reject) => {
            this.db.collection('users').insertOne(obj, (err, result) => {
                if(err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    }

    login(name, password) {
        console.log('Verifying the user');
        return new Promise((resolve, reject) => {
            this.db.collection('users').findOne({
                name: name,
                password: password
            }).then((err, result) => {
                if(err) {
                    reject(err);
                }
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
                if(user) {
                    this.db.collection('contests').find({
                        userId: id
                    }, (err, result) => {
                        if(err) {
                            reject(err);
                        }
                        else {
                            result.toArray().then((contests) => {
                                user.contests = contests;
                                resolve(user);
                            });
                        }
                    });
                }
                else {
                    resolve(null);
                }
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

}

module.exports = new User();
