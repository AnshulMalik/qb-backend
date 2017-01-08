const routes = require('./routes');
const EventEmitter = require('events');
const ev = new EventEmitter();
const url = require('url');
const contestHandler = require('./contest');
const dashboard = require('./dashboard');

module.exports = (server) => {

    let io = require('socket.io').listen(server);

    io.on('connection', (socket) => {
        console.log('User connected');
        /*
        *   To incorporate connections to dynamic urls through socket
        *   Listen for all routes specified in routes and emit events named
        *   as the route's key
         */

        let ns = url.parse(socket.handshake.url, true).query.ns;

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });

        for(let i in routes) {
            let routeRegExp = new RegExp(routes[i]);
            let result = ns.match(routeRegExp);
            if(result) {
                // Create a new namespace or use already existing
                io.of(ns).on('connection', (s) => {
                    ev.emit(i, s, result[result.length - 1]);
                });
                break;
            }
        }

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
        contestHandler.create(data);
    });

    socket.on('list-contacts', (data) => {
        dashboard.listContacts(data.token).then((res) => {
            if(res) {
                socket.emit(res.event, JSON.stringify(res.data));
            }
        });

    });

    socket.on('check-install', (data) => {
        dashboard.checkInstall(data.userId).then((res) => {
            socket.emit(res.event, JSON.stringify(res.data));
        });
    });

    socket.on('disconnect', () => {
        // Handle disconnect logic
    });
});
