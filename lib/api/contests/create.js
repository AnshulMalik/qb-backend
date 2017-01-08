const express = require('express');
const router = express.Router();
const Contest = require('../../services/contestService');
const Question = require('../../services/questionService');

require('../db').then((db) => {

	const contestService = new Contest(db);
    const questionService = new Question(db);

    router.post('/', (req, res) => {
    	var name = req.body.name;
    	var start = req.body.start;
    	var numberOfQuestions = req.body.numberOfQuestions;
    	var hostId = req.body.hostId;

		contestService.create({
			name,
			start,
            numberOfQuestions,
            hostId
		}).then((result) => {
            questionService.generate(result.insertedId);
            return res.json({id: result.insertedId});
		}).catch((err) => {
            console.log('Error occured while creating contest', err);
        });

    });
});

module.exports = router;
