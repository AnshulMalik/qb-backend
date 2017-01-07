var flock = require('flockos');
var fs = require('fs');

var config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

flock.setAppId(config.flock.appId);
flock.setAppSecret(config.flock.appSecret);

module.exports = flock.events.listener;


flock.events.on('app.install', (event) => {
    console.log("App install request", event);
    return {
        text: 'Done'
    };
});
