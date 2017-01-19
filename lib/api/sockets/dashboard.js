const flockService = require('../../services/flockService');
const userService = require('../../services/userService');

module.exports = {
    listContacts: (token) => {
        return new Promise((resolve, reject) => {

            flockService.listContacts(token).then((contacts) => {
                resolve({
                    data: contacts
                });
            }).catch((err) => {
                console.log('Error occured while listing contacts', err);
                resolve(null);
            });
        });
    },

    checkInstall: (userId) => {
        return new Promise((resolve, reject) => {
            userService.exists(userId).then((result) => {
                if(result) {
                    resolve({
                        data: true
                    });
                }
                else {
                    resolve({
                        data: false
                    });
                }
            }).catch((err) => {
                console.log('Error occured while check user install', err);
                reject();
            });
        });
    }

    listLiveContests: (currentTime) => {
        return new Promise((resolve, reject) => {
            contests.find({
                start: {
                    $gt: currentTime
                }
            }).then((result) => {
                resolve(result);
            }).catch((err) => {
                console.log(err);
                reject("Error fetching the live contests");
            });
        });
    }
};
