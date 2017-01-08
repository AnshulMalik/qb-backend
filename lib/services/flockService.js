let flock = require('flockos');
let fs = require('fs');
let config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

flock.setAppId(config.flock.appId);
flock.setAppSecret(config.flock.appSecret);


class Flock {
    constructor() {
        this.extend(this, flock);
        require('../api/db').then((db) => {
            this.db = db;
            this.events.on('app.install', this.handleInstall.bind(this));
            this.events.on('app.uninstall', this.handleUninstall.bind(this));

        }).catch((err) => {
            console.log('Error occured while requiring database', err);
        });

    }

    extend(dest, src) {
        for(let key in src) {
            dest[key] = src[key];
        }
    }

    handleInstall(event) {
        console.log('App install request', event);
        let userId = event.userId;
        let token = event.token;
        try {
            if(!userId || !token) {
              throw new Error('User Id or token missing');
            }
            this.callMethod('users.getInfo', event.token, {}, (err, response) => {
                if(err) {
                    throw err;
                }
                let user = response;
                user.token = token;
                user.status = 'active';
                user._id = user.id;
                delete user.id;
                this.db.collection('users').save(user, (err, result) => {
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
    }


    handleUninstall(event) {
        console.log('App uninstall request', event);
        let userId = event.userId;
        try {
            if(!userId) {
              throw new Error('User Id missing');
            }
            this.db.collection('users').update({
                _id: userId
            }, {
                $set: {
                    status: 'inactive'
                }
            }, (err, result) => {
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
    }

    listContacts(token) {
        return new Promise((resolve, reject) => {
            this.callMethod('roster.listContacts', token, {}, (err, response) => {
                if(err) {
                    reject(err);
                }
                else {
                    resolve(response);
                }
            });
        });
    }

    sendInviteMessage(from, to, payload) {
        /*
            Payload structure:
            {
                type: 'join-contest',
                contestId: 1,
                start: DATE OBJECT
            }
         */
        return new Promise((resolve, reject) => {
            this.callMethod('chat.sendMessage', from.token, {
                to: to.id,
                attachments: [{
                    id: JSON.stringify(payload),
                    appId: config.flock.appId,
                    color: '#0ABE00',
                    views: {
                        flockml: "<strong>Let's play QB</strong><br/>Starts at: " + payload.start.toString().substr(0, 24)
                    },
                    buttons: [{
                        name: 'Play',
                        icon: 'https://icons.iconarchive.com/icons/iconsmind/outline/512/Arrow-Join-icon.png',
                        action: {
                            type: 'openWidget',
                            url: 'https://anshulmalik.me/qb-front/play',
                            sendContext: true,
                        },
                        desktopType: "modal",
                        mobileType: "modal"
                    }]
                }]
            }, (err, response) => {
                console.log(response);
            });
        });
    }
}

let flockService = new Flock();

module.exports = flockService;
