const ObjectId = require('mongodb').ObjectID;

class Question {
    constructor(db) {
        this.db = db;
    }

    generate(contestId) {
        console.log('Generating questions');
    }

    getRandomQuestions(contestId) {
        
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

            let question = this.db.collection('questions').findOne({
                'contestId': contestId,
                'questions.id': questionId
            });
    		let correctAnswers = question.answers;
    		let bonusAnswers = question.bonuses;
            let $set = {};
            let tempContest = `contests.${contestId}`;
            let part = {};
            part[tempContest] = contestId;

            let userContest = this.db.collection('users').find({
                'userId': userId,
            }, part);

    		if(correctAnswers.indexOf(userAnswer) != -1) {
    			// userScore must be updated
    			let points = question.score.answer;

                let solved = userContest.questions;
                if(questionId in questions) {
                    // User has already got points for this answer
                }
                else {
                    // Answer is submitted for the first time

                    let nestedContest = `${tempContest}.solved.questions`;
                    $set[nestedContest] = solved;

    			    this.db.collection('users').update({
                        'userId': userId
                    }, {
                        $set
                    });
                }
    		}

    		if(userAnswer.indexOf(bonusAnswers) != -1) {
                let nestedContest = `${tempContest}.solved.questions.${questionId}.bonuses`;
                $set = {};
		        this.db.collection('users').update({
                    'userID': userID
                },
                {
                    $set: {'score': user.score + points}});
            }
    		else {
    			// notify front end that some validation went wrong over there.
    		}
        });
    }
}

module.exports = Question;
