const express = require('express');
const router = express.Router();
const Contest = require('../../services/contestService');
const Question = require('../../services/questionService');
const Response = require('../../response');
const StatusCodes = require('../../statusCodes');

require('../db').then((db) => {

	const contestService = new Contest(db);
    const questionService = new Question(db);

    router.post('/', (req, res) => {

        var r = new Response();

    	let name = req.body.name;
    	let start = req.body.start;
    	let numberOfQuestions = req.body.numberOfQuestions;
    	let hostId = req.body.hostId;

        let nameRegex = /[a-zA-Z -]+/
        let nameMatch = name.match(nameRegex);
        let currentTime = Date.now();

        // Validating time
        if(start < currentTime) {
            r.status = StatusCodes.BAD_INPUT;
            r.data = 
            r.data = 'Time violating its validation, already expired';
            return res.json(r);
        }

        // Validating name
        if(nameMatch[0].length != name.length) {
            r.status = StatusCodes.BAD_INPUT;
            r.data = 'Name violating its validation, contains only alphabets, \' \', \'-\' ';
            return res.json(r);
        }

        // Validating number of questions
        if(numberOfQuestions == 5 || numberOfQuestions == 10 || numberOfQuestions == 20) {
            r.status = StatusCodes.BAD_INPUT;
            r.data = 'Number violating its validation, valid values = 5,10,20';
            return res.json(r);
        }

		contestService.create({
			name,
			start,
            numberOfQuestions,
            hostId
		}).then((result) => {
            questionService.generate(result.insertedId);
            r.status = StatusCodes.SUCCESS;
            r.data = "Event created successfully";
            r.id = result.insertedId;
            return res.json(r);
		}).catch((err) => {
            r.status = StatusCodes.SERVER_ERROR;
            r.data = 'Error occured while creating contest' + err;
            return res.json(r)
        });

    });
});

module.exports = router;
