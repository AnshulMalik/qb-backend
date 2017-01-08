var flock = require('flockos');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

flock.setAppId(config.flock.appId);
flock.setAppSecret(config.flock.appSecret);

module.exports = flock.events.listener;


require('./lib/api/db').then((db) => {

    flock.events.on('app.install', (event) => {
        console.log('App install request', event);
        let userId = event.userId;
        let token = event.token;
        try {
            if(!userId || !token) {
              throw new Error('User Id or token missing');
            }
            flock.callMethod('users.getInfo', event.token, {}, (err, response) => {
                if(err) {
                    throw err;
                }
                let user = response;
                user.token = token;
                user.status = 'active';
                user._id = user.id;
                delete user.id;
                db.collection('users').save(user, (err, result) => {
                    if(err) {
                        throw err;
                    }

                    console.log(user.firstName, 'installed the app.');
                    return {
                        text: 'Installed successfully'
                    };
                });
            });
        }
        catch(e) {
            console.log('Token verification failed', e);
            return {
                error: 'Error occured'
            };
        }
    });



    flock.events.on('app.uninstall', (event) => {
        console.log('App uninstall request', event);
        let userId = event.userId;
        try {
            if(!userId) {
              throw new Error('User Id missing');
            }
            db.collection('users').update({ _id: userId }, { $set: { status: 'inactive' }}, (err, result) => {
                if(err) {
                    throw err;
                }

                console.log(userId, 'uninstalled the app.');
                return {
                    text: 'Uninstalled successfully'
                };
            });
        }
        catch(e) {
            console.log("Uninstall failed", e);
            return {
                error: 'Error occured'
            };
        }
    });


    flock.events.on('client.pressButton', (event) => {
        console.log(event);
    });

}).catch((err) => {
    console.log('Error occured while requiring database', err);
});
