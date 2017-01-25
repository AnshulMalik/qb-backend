var fs = require('fs');
var values = fs.readFileSync('./python', 'utf8').split('\n');
require('../lib/api/db').then(function(db) {

    for(var value of values) {
        if(value) {
            var row = JSON.parse(value);
            db.collection('questions').insertOne({
                description: row.question,
                language: 'python',
                level: 1,
                solutions: row.answers.map((txt) => { return {answer: txt, points: 5};})
            });
        }
    }
});
