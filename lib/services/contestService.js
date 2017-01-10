let ObjectId = require('mongodb').ObjectID;

class Contest {

    constructor(db) {
        this.db = db;
    }

    create(obj) {
        console.log('Creating contest');
        return new Promise((resolve, reject) => {
            this.db.collection('contests').insertOne(obj, (err, result) => {
                if(err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    }

    setQuestions(contestId, questions) {
        return new Promise((resolve, reject) => {
            this.db.collection('contests').update({
                _id: contestId
            }, {
                $set: {
                    questions
                }
            }, (err, response) => {
                resolve(response);
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
}

module.exports = Contest;
