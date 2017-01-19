const dashboard = require('./dashboard');
const constants = require('../constants/socket');
const flockService = require('../../services/flockService');

module.exports = (server) => {

    let io = require('socket.io').listen(server);

    io.use((socket, next) => {
        let token = socket.request._query.eventToken;
        let userId = socket.request._query.userId;
        socket.userId = 'u:aooykoiy9hihmp8i';
        payload = flockService.events.verifyToken(token);
        if(payload && payload.userId === userId) {
            socket.userId = userId;
            next();
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

ev.on('joinContest', (socket, param) => {
    // This socket is now ready to listen to events happening in
    // the specified contest
    console.log('contest join request, id:', param);

    s.on('disconect', () => {
        // Handle disconnect logic
    });

    // Verify the identity of user from the request and allow or deny
    // join request
});

ev.on('global', (socket, param)=> {
    // All global events are to be handled here
    // like: create contest

    socket.on('create-contest', (data) => {
        contestHandler.create(data).then((data)=> {

        }).catch((err) => {

        });
    });

    socket.on('list-contacts', (data) => {
        dashboard.listContacts(data.token).then((res) => {
            if(res) {
                socket.emit(constants.emit.listContacts, JSON.stringify(res.data));
            }
        });

    });

    socket.on('check-install', (data) => {
        dashboard.checkInstall(data.userId).then((res) => {
            socket.emit(constants.emit.checkInstall, JSON.stringify(res.data));
        });
    });

    socket.on('list-live-contests', (data) => {
        dashboard.listLiveContests(Date.now()).then((res) => {
            socket.emit(constants.emit.listLiveContests, JSON.stringify(res.data));
        });
    });

    socket.on('disconnect', () => {
        // Handle disconnect logic
    });
});
