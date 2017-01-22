const flock = require('flockos');
const fs = require('fs');
const config = require('../../config.json');
const ObjectId = require('mongodb').ObjectID;
const userService = require('./userService');

flock.setAppId(config.flock.appId);
flock.setAppSecret(config.flock.appSecret);


class Leaderboard {

    // Initiaing the class User with db as private variable.
    constructor() {
        require('../api/db').then((db) => {
            this.db = db;
        }).catch((err) => {
            console.log('Error occured while requiring database', err);
        });
    }

    init(contestId, participants) {
        let score = {};
        let solved = {};
        participants.map((participantId) => {
            score[participantId] = 0;
            solved[participantId] = [];
        });
        return this.db.collection('leaderboards').insertOne({
            _id: new ObjectId(contestId),
            solved,
            score
        });
    }

    incrementPoints(contestId, userId, points) {
        let path = 'score.' + userId;
        let updateObj = {};
        updateObj[path] = points;
        return new Promise((resolve, reject) => {
            this.db.collection('leaderboards').findOneAndUpdate({
                _id: new ObjectId(contestId),
            }, {
                $inc: updateObj
            }).then((resp) => {
                console.log('incrementPoints', resp);
                console.log('returning from incrementPoints', resp.value.score[userId]);
                resolve(resp.value.score[userId]);
            });
        });
    }

    getLeaderboard(contestId) {
        return new Promise((resolve, reject) => {
            this.db.collection('leaderboards').findOne({
                _id: new ObjectId(contestId),
            }).then((leaderboard) => {
                console.log(leaderboard);
                let users = Object.keys(leaderboard.score);
                let data = [];
                Promise.all(users.map((userId) => {
                    return new Promise((resolve, reject) => {
                        console.log('fetcing profile for', userId)
                        userService.getProfile(userId).then((profile) => {
                            console.log(profile);
                            data.push({
                                id: profile['_id'],
                                firstName: profile.firstName,
                                lastName: profile.lastName,
                                score: leaderboard.score[userId]
                            });
                            resolve(1);
                        });
                    })
                })).then((done) => {
                    console.log('Resolved leaderboard', data);
                    resolve(data);
                }).catch((err) => {
                    console.trace(err);
                });

            });
        });
    }

}

module.exports = new Leaderboard();
