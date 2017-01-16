const flock = require('flockos');
const fs = require('fs');
const config = require('../../config.json');
const ObjectId = require('mongodb').ObjectID;
const contestService = require('./contestService');
const util = require('util');
const ipc=require('node-ipc');

flock.setAppId(config.flock.appId);
flock.setAppSecret(config.flock.appSecret);

ipc.config.id = 'client';
ipc.config.retry = 1000;


class Question {
    constructor() {
        require('../api/db').then((db) => {
            this.db = db;
        }).catch((err) => {
            console.log('Error occured while requiring database', err);
        });
        ipc.connectTo('generateProcess', () => {
            ipc.of.generateProcess.on('connect', () => {
                ipc.log('## Connected to generate process ##');
                this.ipc = ipc.of.generateProcess;
            });
            ipc.of.generateProcess.on('disconnect', () => {
                ipc.log('Disconnected from generate process');
            });
        });
    }

    generate(contestId) {
        // Generates questions for contest
        this.ipc.emit('app.message', {
            contestId
        });
    }

    getRandomQuestions(contestId) {
        return new Promise((resolve, reject) => {
            contestService.getContest(contestId).then((details) => {
                let count = details.numberOfQuestions;
                let language = details.language;
                this.getQuestions(language).then((questions) => {
                    let output = new Set();
                    while(output.size < count) {
                        output.add(questions[Math.floor(Math.random() * questions.length)]);
                    }
                    resolve(Array.from(output));
                }).catch((err) => {
                    console.log('Failed to fetch the questions for contestId ', contestId);
                    reject(err);
                });
            });
        });
    }

    getQuestions(language) {
        return new Promise((resolve, reject) => {
            this.db.collection('questions').find({
                language: language
            }, (err, result) => {
                if(err)
                    reject(err);
                else{
                    result.toArray((err, res) => {
                        resolve(res);
                    });
                }
            });
        });
    }

    getQuestionById(questionId) {
        return this.db.collection('questions').findOne({
            _id: new ObjectId(questionId)
        });
    }

    getAnswers(id) {
        return new Promise((resolve, reject) => {
            this.db.collection('questions').findOne({
                _id: new ObjectId(id)
            }, {
                solutions: 1,
                _id: 0
            }, (err, result) => {
                if(err) {
                    reject(err);
                }
                else {
                    if(result) {
                        let temp = result.solutions.map((solution) => {
                            return solution.answer.toUpperCase();
                        });
                        resolve(temp);
                    }
                    else {
                        reject('Not found');
                    }
                }
            });
        });
    }

    verifyAnswer(userId, contestId, questionId, userAnswer) {
        return new Promise((resolve, reject) => {
            contestService.getQuestionWords(contestId, questionId).then((words) => {
                this.getQuestion(questionId).then((question) => {
                    let solutions = question.solutions;
                    let correctAnswers = solutions.map((solution) => {
                        return solution.answer;
                    });
                    let correctPoints = solutions.map((solution) => {
                        return solution.score;
                    });
                    let splitted = userAnswer.split(',');
                    let $set = {};
                    let tempContest = `contests.${contestId}`;
                    let part = {};
                    part[tempContest] = contestId;

                    this.db.collection('users').find({
                        'userId': userId,
                    }, part).then((user) => {
                        let answerIndex = indexOf(splitted[2]);

                        if(answerIndex != -1) {
                            // Submitted text is one of the answers
                            // userScore must be updated
                            let points = correctPoints[answerIndex];
                            // Get solved questions of this user in this contest
                        }

                        else if(userAnswer.indexOf(bonusAnswers) != -1) {
                            let nestedContest = `${tempContest}.solved.questions.${questionId}`;
                        }

                        else {
                            // notify front end that some validation went wrong over there.
                        }

                    });
                });
            });
        });
    }
}

module.exports = new Question();
