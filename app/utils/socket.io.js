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
		cookieParser: express.cookieParser, //or connect.cookieParser
		key: 'connect.sid',        //the cookie where express (or connect) stores its session id.
		secret: cfg.sessionSecret,  //the session secret to parse the cookie
		store: sessionStore,      //the session store that express uses
		fail: function (data, accept) {      // *optional* callbacks on success or fail
			accept(null, false);              // second param takes boolean on whether or not to allow handshake
		},
		success: function (data, accept) {
			accept(null, true);
		}
	}));

	io.of('/projects-update').on('connection', function (socket) {
		if (!socket.handshake.user) return socket.emit('error', 'unauthorized!')

		var timer = 'updating projects for ' + socket.handshake.user.username
		console.time(timer)
		var task = require('../utils/update-user-projects')(socket.handshake.user)

		task.on('progress', function (desc) {
			socket.emit('progress', desc)
		})
		task.on('done', function () {
			socket.emit('done')
			console.timeEnd(timer)
		})

		task.on('error', function (error) {
			console.log(error)
			socket.emit('error', 'failed to update')
			console.timeEnd(timer)
		})
	});

	instance = io
}