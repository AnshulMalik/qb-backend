const flockService = require('../../services/flockService');
const userService = require('../../services/userService');
const constants = require('../constants/socket');

module.exports = {
    listContacts: (token) => {
        return new Promise((resolve, reject) => {

            flockService.listContacts(token).then((contacts) => {
                resolve({
                    event: constants.emit.listContacts,
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
                        event: constants.emit.checkInstall,
                        data: true
                    });
                }
                else {
                    resolve({
                        event: constants.emit.checkInstall,
                        data: false
                    });
                }
            }).catch((err) => {
                console.log('Error occured while check user install', err);
                reject();
            });
        });
    }
};
