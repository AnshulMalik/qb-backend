const flockService = require('../../services/flockService');
const userService = require('../../services/userService');
const contestService = require('../../services/contestService');
const questionService = require('../../services/questionService');
const constants = require('../constants/socket');
const statusCodes = require('../../statusCodes');
const Response = require('../../response');

let LANGUAGES = ['nodejs', 'english', 'python'];
let CONTEST_MAX_DURATION = 3600000000; // A contest can run for max 10 minues

module.exports = {


    joinContest: (io, socket, params) => {
        /*
            @param userId - Id of user joining the contest
            @param contestId - Id of contest to join
         */
        if(!params.userId)
            return socket.emit(constants.emit.error, {error: 'userId is required'});
        else if(!params.contestId)
            return socket.emit(constants.emit.error, {error: 'contestId is required'});

        userService.getProfile(params.userId).then((user) => {
            if(user.contests.indexOf(params.contestId) != -1) {
                socket.join(params.contestId);
                socket.emit(constants.emit.joinContest, {message: 'Joined'});
            }
            else {
                socket.emit(constants.emit.joinContest, {error: 'Access denied'});
            }
        });
    },

    listContacts: (io, socket, params) => {
        /*
            @param userId - Id of user whose contacts to be listed
         */

        socket.emit(constants.emit.listContacts, [{
            firstName: 'Anshul', 'lastName': 'Malik', 'id': 'u:aooykoiy9hihmp8i'
        }, {
            firstName: 'Rewanth', 'lastName': 'Cool', 'id': 'u:xn2n7731qz2zf322'
        }]);
        /*
        userService.getProfile(params.userId).then((result) => {
            if(result) {
                flockService.listContacts(result.token).then((contacts) => {
                    socket.emit(constants.emit.listContacts, contacts);
                }).catch((err) => {
                    socket.emit(constants.emit.error, {error: 'Server error'});
                    console.trace(err);
                });
            }
            else {
                // We don't have token of the user, so can't fetch the contacts
                socket.emit(constants.emit.installRequired, {message: 'Install is required first'});
            }
        });
        */
    },

    createContest: (io, socket, params) => {
        /*
            @param name                 Name of contest
            @param start                Start time(timestamp) of contest
            @param numberOfQuestions    Number of questions in contest
            @param language             Primary language of the contest
         */
        let r = new Response();
        let name = params.name || '';
        let start = params.start;
        let numberOfQuestions = params.numberOfQuestions || 5;
        let hostId = socket.userId;
        let language = params.language || '';
        let nameRegex = /[a-zA-Z -]+/;
        let nameMatch = name.match(nameRegex);
        let currentTime = Date.now();
        let solved = {};
        let errors = [];
        // Validating time
        if(!start || start > currentTime) {
            errors.push({start: 'Time violating its validation, already expired'});
        }

        // Validating name
        if(!nameMatch || nameMatch[0].length !== name.length) {
            errors.push({name: 'Name violating its validation, contains only alphabets, \' \', \'-\' '});
        }

        // Validating language
        if(LANGUAGES.indexOf(language.toLowerCase()) === -1) {
            errors.push({language: 'Language is not supported'});
        }

        // Validating number of questions
        if(!(numberOfQuestions === 5 || numberOfQuestions === 10 || numberOfQuestions === 20)) {
            errors.push({numberOfQuestions: 'Number violating its validation, valid values = 5,10,20'});
        }

        if(!Array.isArray(params.participants)) {
            errors.push({participants: 'Participants must be an array'});
        }

        if(errors.length) {
            return socket.emit(constants.emit.createContest, {errors});
        }

        params.participants.push(socket.userId);

        params.participants.map((participant) => {
            solved[participant] = { answers: [], bonuses: [] };
        });

        contestService.create({
            name,
            start,
            numberOfQuestions,
            language,
            hostId,
            participants: params.participants,
            solved
        }).then((result) => {
            r.status = statusCodes.SUCCESS;
            r.data = "Contest created";
            questionService.generate(result.insertedId);
            return socket.emit(constants.emit.createContest, r);
        }).catch((err) => {
            console.trace(err);
            r.status = StatusCodes.SERVER_ERROR;
            r.data = 'Error occured while creating contest';
            return socket.emit(constants.emit.createContest, r);
        });
    },

    getQuestions: (io, socket, params) => {
        let contestId = params.contestId;
        let r = new Response();
        contestService.getContest(contestId).then((contest) => {
            if(contest.start - Date.now() > 0) {
                // Request to fetch questions, before contest start
                r.status = statusCodes.NOT_AUTHORIZED;
                r.data = "Can't request questions before contest start";
            }
            else if(Date.now() - contest.start > CONTEST_MAX_DURATION) {
                // Request to fetch questions after contest has ended
                r.status = statusCodes.NOT_AUTHORIZED;
                r.data = "Can't request questions after contest has ended";
            }
            else if((contest.participants.indexOf(socket.userId) !== -1 ||
                contest.hostId === socket.userId) &&
                Date.now() - contest.start < CONTEST_MAX_DURATION
                ) {
                for(let obj of Object.keys(contest.questions))  {
                    let tempHashes = [];
                    for(let ques in contest.questions[obj].words) {
                        tempHashes.push(contest.questions[obj].words[ques].hash);
                    }
                    contest.questions[obj].words = tempHashes;
                }
                r.status = statusCodes.SUCCESS;
                r.data = contest.questions;
            }
            else {
                r.status = statusCodes.NOT_AUTHORIZED;
                r.data = "Not registered in the contest";
            }
            socket.emit(constants.emit.getQuestions, r);
        });
    },

    submitAnswer: (io, socket, params) => {
        /*
            @param questionId           Id of question
            @param contestId            Id of contest
            @param text                 Answer of the question with coordinates
         */
        let r = new Response();
        let questionId = params.questionId;
        let answer = params.text.split(',');
        answer[2] = answer[2].toUpperCase();
        let contestId = params.contestId;
        let userId = socket.userId;
        if(!questionId || answer.length !== 3 || !contestId || !userId) {
            return socket.emit(constants.emit.error, {message: 'Some parameter is missing'});
        }
        console.log('Requestng contest service to mark solved');

        contestService.getQuestionWords(contestId, questionId).then((words) => {
            // Get position of all words placed on the grid
            console.log(words);
            questionService.verifyAnswer(questionId, answer[2]).then((points) => {
                if(points) {
                    // Answer is correct, validate position
                    let coord = words[answer[2]].start;
                    if(coord[0] == answer[0] && coord[1] == answer[1]) {
                        // Starting coordinates are correct
                        //userService.markSolved(userId, questionId);
                        contestService.markSolved(userId, contestId, questionId, points, answer[2], 'answer').then((newScore) => {
                            if(newScore) {
                                // Answer was submitted for the first time
                                // Emits leaderboard updated event
                                r.status = statusCodes.SUCCESS;
                                r.data = { userId, newScore };
                                io.of(contestId).broadcast(constants.emit.leaderboardUpdated, r);
                                // Sent to all
                            }
                            else {
                                // User already got points for the answer
                                r.status = statusCodes.ALREADY_SUBMITTED;
                                socket.emit(constants.emit.submitAnswer, r);
                            }
                        });

                    }
                    else {
                        // Emit error, invalid attempt
                        r.status = statusCodes.BAD_INPUT;
                        r.data = { message: 'Invalid attempt'};
                        socket.emit(constants.emit.error, r);
                    }
                }
                else {
                    // Text is not in answer, search in bonus answers
                    let bonuses = Object.keys(words);
                    if(answer[2] in bonuses) {
                        // Bonus is solved, verify coordinates
                        let coord = words[answer[2]].start;
                        if(coord[0] == answer[0] && coord[1] == answer[1]) {
                            contestService.markSolved(userId, contestId, questionId, points, answer[2], 'bonus').then((newScore) => {
                                if(newScore) {
                                    // Bonus is not already solved
                                    r.status = statusCodes.SUCCESS;
                                    r.data = { userId, newScore };
                                    io.of(contestId).broadcast(constants.emit.leaderboardUpdated, r);
                                    // Sent to all
                                }
                                else {
                                    // Bonus was already solved, so no points given
                                    r.status = statusCodes.ALREADY_SUBMITTED;
                                    socket.emit(constants.emit.submitAnswer, r);
                                }
                            });
                        }
                    }
                    else {
                        r.status = statusCodes.INCORRECT_ANSWER;
                        socket.emit(constants.emit.incorrectAnswer, r);
                    }
                }
            });
        });
    },

    listLive: (io, socket, params) => {
        let r = new Reponse();
        contestService.listLive().then((contests) => {
            r.status = statusCodes.SUCCESS;
            r.data = contests;
            socket.emit(constants.emit.listLive, r);
        });
    }

};
