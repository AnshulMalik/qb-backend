const fs = require('fs');
const values = fs.readFileSync('./c++', 'utf8').split('\n');
require('../lib/api/db').then((db) => {

    for(let value of values) {
        if(value) {
            let row = JSON.parse(value);
            db.collection('questions').insertOne({
                description: row.question,
                language: 'c++',
                level: 1,
                solutions: row.answers.map((txt) => { return {answer: txt, points: 5};})
            });
        }
    }
});
