var express = require('express');
var router = express.Router();

// Import Contest service and use tht to interact 
// with contest

router.post('/', (req, res) => {
	var name = req.body.name;
	var start = req.body.start;
	var end; //To be computed later based on the difficulty of questions
	var numberOfQuestions = req.body.numberOfQuestions;
	var hostID = req.body.hostID;

	// TODO
	//db.instance.collection('contest').insert({'name': name, 'start' : start, 'end': end, 'numberOfQuestions' : numberOfQuestions, 'hostID' : hostID});

	// Here comes a function which will be calling the function which generates the questions
	// var questions = GenerateQuestions()

	// storing the questions for future use
	//db.instance.collections('contestQuestions').insert({'contestID': contestID, 'questions': questions});

});