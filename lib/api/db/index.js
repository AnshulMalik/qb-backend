var MongoClient = require('mongodb').MongoClient;
var config = require('../../../config.json');

var database = null;

module.exports = new Promise((resolve, reject) => {
        try {
            if(database === null) {
                MongoClient.connect(config.mongoUrl, (err, db) => {
                    if(err) {
                        console.log("Can not connect to database ", err);
                        reject(err);
                    }
                    console.log('Connected to database');
                    database = db;
                    resolve(database);
                });
            }
            else {
                resolve(database);
            }
        }
        catch(e) {
            reject(e);
        }
    });
