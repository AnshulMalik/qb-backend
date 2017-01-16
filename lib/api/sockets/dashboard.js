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
        if(!params.userId)
            return socket.emit(constants.emit.error, {error: 'userId is required'});
        else if(!params.contestId)
            return socket.emit(constants.emit.error, {error: 'contestId is required'});

        userService.getProfile(params.userId).then((user) => {
            if(user.contests.indexOf(params.contestId) != -1) {
                socket.join(params.id);
                socket.emit(constants.emit.joinContest, {message: 'Joined'});
            }
            else {
                socket.emit(constants.emit.joinContest, {error: 'Access denied'});
            }
        });
    },

    listContacts: (io, socket, params) => {
        if(!params.eventToken)
            return socket.emit(constants.emit.error, { error: 'Event token is required' });

        let payload = flockService.events.verifyToken(params.eventToken);
        userService.getProfile(payload.userId).then((result) => {
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
    },

    createContest: (io, socket, params) => {
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

        params.participants.map((participant) => {
            solved[participant] = {};
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
    }
};
