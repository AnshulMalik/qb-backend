const routes = require('./routes');
const EventEmitter = require('events');
const ev = new EventEmitter();
const url = require('url');
const contestHandler = require('./contest');

module.exports = (server) => {

    let io = require('socket.io').listen(server);
    console.log('Sockets file loaded');

    io.on('connection', (socket) => {
        /*
        *   To incorporate connections to dynamic urls through socket
        *   Listen for all routes specified in routes and emit events named
        *   as the route's key
         */

        console.log(socket.handshake.url);
        let ns = url.parse(socket.handshake.url, true).query.ns;
        console.log('connected ns: '+ ns);

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });

        for(let i in routes) {
            let routeRegExp = new RegExp(routes[i]);
            let result = ns.match(routeRegExp);
            if(result) {
                console.log('Matched', i);

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

    socket.on('create-contest', contestHandler.create);

    socket.on('disconnect', () => {
        // Handle disconnect logic
    });
});