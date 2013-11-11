/**
 * Author: krasu
 * Date: 9/19/13
 * Time: 5:09 PM
 */
var instance,
    passportSocketIo = require('passport.socketio'),
    express = require('express'),
    cfg = require('../../config')

module.exports = function (server, sessionStore) {
    if (instance) return instance

    var io = require('socket.io').listen(server);

    io.configure('production', function () {
        io.enable('browser client minification');
        io.enable('browser client etag');
        io.enable('browser client gzip');
        io.set('transports', [
            'websocket',
            'flashsocket',
            'htmlfile',
            'xhr-polling',
            'jsonp-polling'
        ]);
        io.set('polling duration', 10);
    });

    io.configure('development', function () {
        io.set('transports', ['websocket']);
    });

    io.set('authorization', passportSocketIo.authorize({
        cookieParser: express.cookieParser,
        key: 'connect.sid',
        secret: cfg.sessionSecret,
        store: sessionStore
    }));

    io.of('/projects-update/status').on('connection', function (socket) {
        if (!socket.handshake.user) return socket.emit('error', 'unauthorized!')

        socket.join(socket.handshake.user._id)

        socket.on('start', function() {
            var state = socket.handshake.user.projectsUpdater
            !state.updating && require('./updater')(socket.handshake.user)
        })
    });

    instance = io
}