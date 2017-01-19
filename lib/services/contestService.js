const ObjectId = require('mongodb').ObjectID;
const userService = require('./userService');
const leaderboardService = require('./leaderboardService');
const flock = require('flockos');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

flock.setAppId(config.flock.appId);
flock.setAppSecret(config.flock.appSecret);


class Contest {

    constructor() {
        this.userService = userService;
        require('../api/db').then((db) => {
            this.db = db;
        }).catch((err) => {
            console.trace('Error occured while requiring database', err);
        });
    }

    create(obj) {
        return new Promise((resolve, reject) => {
            this.db.collection('contests').insertOne(obj, (err, result) => {
                if(err) {
                    reject(err);
                }
                leaderboardService.init(result.insertedId, obj.participants);
                obj.participants.forEach((pid) => {
                    userService.addContest(pid, result.insertedId);
                });
                resolve(result);
            });
        });
    }

    setQuestions(contestId, questions) {
        return new Promise((resolve, reject) => {
            this.db.collection('contests').findOne({
                _id: new ObjectId(contestId)
            }, {
                _id: 0,
                solved: 1
            }).then((details) => {
                let questionIds = Object.keys(questions);
                let users = Object.keys(details.solved);

                let solved = {};
                users.map((userId) => {
                    solved[userId] = {};
                    questionIds.map((questionId) => {
                        solved[userId][questionId] = details.solved[userId];
                    });
                });
                this.db.collection('contests').update({
                    _id: new ObjectId(contestId)
                }, {
                    $set: {
                        questions,
                        solved
                    }
                }, (err, response) => {
                    resolve(response);
                });
            });
        });
    }

    getContest(contestId) {
        return new Promise((resolve, reject) => {
            this.db.collection('contests').findOne({
                _id: new ObjectId(contestId)
            }, (err, result) => {
                if(err)
                    reject(err);
                else
                    resolve(result);
            });
        });
    }

    getLeaderboard(contestId) {
        return new Promise((resolve, reject) => {
            this.db.collection('contests').findOne({
                _id: new ObjectId(contestId)
            }, {'participants': 1}, (err, result) => {
                if(err) {
                    reject(err);
                }
                else {
                    this.userService.getUserNames(Object.keys(result.participants)).then((users) => {
                        let ans = [];
                        users.map((user) =>{
                            ans.push({
                                id: user['_id'],
                                score: result.participants[user._id].score,
                                name: user.name
                            });
                        });
                        resolve(ans);
                    });

                }
            });
        });
    }

    getQuestionWords(contestId, questionId) {
        return new Promise((resolve, reject) => {
            this.db.collection('contests').findOne({
                _id: new ObjectId(contestId)
            }, {
                questions: 1
            }).then((data) => {
                if(data) {
                    resolve(data.questions[questionId].words);
                }
                else {
                    reject(null);
                }
            });
        });
    }

    markSolved(userId, contestId, questionId, points, text, type) {
        /*
            marks the answer as solved
            @param type: 'answer' or 'bonus'
         */
        return new Promise((resolve, reject) => {
            let path = `solved.${userId}.${questionId}`;
            let $set = { _id: 0 };
            $set[path] = 1;
            this.db.collection('contests').findOne({
                _id: new ObjectId(contestId)
            }, $set).then((details) => {

                switch(type) {
                    case 'answer':

                        let answers = details.solved[userId][questionId].answers || [];
                        if(answers.indexOf(text) !== -1) {
                            // Already solved this question
                            console.log('already solved');
                            resolve(false);
                        }
                        else {
                            // Update user collection, set this question solved.
                            console.log('Not already solved');
                            answers.push(text);
                            let newPath = path + '.answers';
                            $set = {};
                            $set[newPath] = answers;
                            console.log('updating', newPath, answers);

                            this.db.collection('contests').update({
                                _id: new ObjectId(contestId)
                            }, {
                                $set
                            }).then((data) => {

                            }).catch((err) => {
                            });

                            leaderboardService.incrementPoints(contestId, userId, points).then((newScore) => {
                                resolve(newScore);
                            });
                        }
                        break;

                    case 'bonus':
                        let bonuses = details.solved[userId][questionId].bonuses || [];
                        if(bonuses.indexOf(text) !== -1) {
                            // Already solved this question
                            console.log('already solved bonus');
                            resolve(false);
                        }
                        else {
                            console.log('Not already solved bonus');
                            bonuses.push(text);
                            let newPath = path + '.bonuses';
                            $set = {};
                            $set[newPath] = bonuses;

                            this.db.collection('contests').update({
                                _id: new ObjectId(contestId)
                            }, {
                                $set
                            }).then((data) => {

                            }).catch((err) => {

                            });

                            leaderboardService.incrementPoints(contestId, userId, points).then((newScore) => {
                                resolve(newScore);
                            });
                        }
                        break;
                }
                resolve(details);
            });
        });
    }

    listLive() {
        let a = this.db.collection('contests').find({

        }, {
            _id: 1
        });
        return a.toArray();
    }
}

module.exports = new Contest();
