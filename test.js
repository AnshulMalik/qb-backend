let words = require('./english');

require('./lib/api/db').then((db ) => {
    db.collection('dictionaries').insertOne({
        words,
        language: 'english',
        topic: 'english'
    })
})
