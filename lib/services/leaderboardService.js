const flock = require('flockos');
const fs = require('fs');
const config = require('../../config.json');
const ObjectId = require('mongodb').ObjectID;

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
                resolve(resp.value.score[userId]);
            });
        });
    }

}

module.exports = new Leaderboard();
