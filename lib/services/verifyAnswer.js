var express = require('express');
var router = express.Router();
var db = require('../api/db');

module.exports = {
	verifyAnswer: (userID, contestID, questionNo, userAnswer) => {
		let questions = db.instance.collections('questions').find({'contestID': contestID});
		let question = questions[questionNo];
		let correctAnswer = question['answer'];
		let bonusAnswers = question['bonus'];

		if(userAnswer == correctAnswer) {
			// userScore must be updated
			let points = question.score['answer'];
			let user = db.instance.collections('scorecard').find({'userID'; userID, 'contestID': contestID});
			let solved = user.solved;
			solved.push(question)
			db.instance.collections('scorecard').update({'userID': userID, 'contestID': contestID}, {$set: {'score': user.score + points}, {'solved': solved}});
		}
		else if(bonusAnswers.indexOf(userAnswer) != -1) {
			// give the user a bonus score
			let points = question.score['bonus'];
			let user = db.instance.collections('scorecard').find({'userID'; userID, 'contestID': contestID});
			db.instance.collections('scorecard').update({'userID': userID, 'contestID': contestID}, {$set: {'score': user.score + points}});
		}
		else {
			// notify front end that some validation went wrong over there.
		}

	}
}