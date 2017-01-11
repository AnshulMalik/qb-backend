const ObjectId = require('mongodb').ObjectID;
const userService = require('./userService') ;

class Contest {

    constructor(db) {
        this.db = db;
        this.userService  = userService;
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
                        let ans = []
                        users.map((user) =>{
                            ans.push({
                                id: user['_id'],
                                score: result.participants[user._id].score,
                                name: user.name
                            })
                        });
                        resolve(ans);
                    });

                }
            });
        });
    }

}

module.exports = Contest;
