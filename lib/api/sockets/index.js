const dashboard = require('./dashboard');
const constants = require('../constants/socket');
const flockService = require('../../services/flockService');
const userService = require('../../services/userService');

module.exports = (server) => {

    let io = require('socket.io').listen(server);

    io.use((socket, next) => {
        let token = socket.request._query.eventToken;
        let userId = socket.request._query.userId;
        //socket.userId = 'u:aooykoiy9hihmp8i';
        payload = flockService.events.verifyToken(token);
        if(payload && payload.userId === userId) {
            socket.userId = userId;
            userService.getProfile(userId).then((user) => {
                if(user) {
                    socket.token = user.token;
                }
                next();
            }).catch((err) => {
                console.trace(err);
                next();
            });
        }
        else {
            console.log('Invalid token, dropping');
            socket.emit('err', {error: 'Invalid token, try again with a valid token'});
        }

    });
    io.on('connection', (socket) => {
        console.log('User connected');

        for(let a of Object.keys(dashboard)) {
            socket.on(constants.events[a], dashboard[a].bind(this, io, socket));
        }

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
    return io;
};
