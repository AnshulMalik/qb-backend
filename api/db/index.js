var MongoClient = require('mongodb').MongoClient;
var config = require('../../config.json');

var db = {
    instance: null
};

module.exports = db;

if(db.instance === null) {
    MongoClient.connect(config.mongoUrl, function(err, db) {
        if(err) {
            console.log("Can not connect to database ", err);
            reject(err);
        }
        console.log('Connected to database');
        db.instance = db;
    });
}
